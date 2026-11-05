import { OpenAPI } from "../generated/discord-dungeon-api";
import { registerSettings } from "./settings";
import { registerSoundHooks } from "./sound-hooks";

const MODULE_ID = "discord-dungeon-foundry-vtt";
const SOCKET_NAME = `module.${MODULE_ID}`
;
const LIVE_API_BASE = import.meta.env.VITE_DISCORD_DUNGEON_BASE_URL;
//const LOCAL_API_BASE = "http://localhost:3001";
const PLAYER_KEY_GRACE_PERIOD_MS = 3 * 60 * 1000;
const CLIENT_READY_RETRY_MS = 5000;
const PLAYER_KEY_RETRY_MS = 5000;
const PLAYER_KEY_RESPONSE_TIMEOUT_MS = 10_000;
const CLIENT_KEY_WATCH_INTERVAL_MS = 2000;

type FoundrySocket = {
  on: (
    eventName: string,
    callback: (message: ApiKeySocketMessage) => void | Promise<void>,
  ) => void;

  emit: (eventName: string, message: ApiKeySocketMessage) => void;
};

function getFoundrySocket(): FoundrySocket | undefined {
  return (game as unknown as { socket?: FoundrySocket }).socket;
}

type ApiKeySocketMessage =
  | {
      type: "request-api-key";
      requestId: string;
      targetUserId: string;
      requestingUserId: string;
    }
  | {
      type: "api-key-response";
      requestId: string;
      targetUserId: string;
      apiKey?: string;
      error?: string;
    }
  | {
      type: "client-socket-ready";
      userId: string;
    }
  | {
      type: "request-client-ready";
      targetUserId: string;
      requestingUserId: string;
    };

type CreateGameSessionResponse = {
  id: string;
};

type FoundryWorldWithTitle = {
  id?: string;
  title?: string;
};

const pendingApiKeyRequests = new Map<
  string,
  {
    resolve: (apiKey: string | undefined) => void;
    timeoutId: number;
  }
>();

const activeSessionApiKeys = new Map<string, string>();

type PendingPlayerJoin = {
  ready: boolean;
  queued: boolean;
  completed: boolean;
  keyAttempts: number;
  joinedAt: string;
  fallbackDue: boolean;
  fallbackTimer?: number;
  readyTimer?: number;
  debounceTimer?: number;
  keyRetryTimer?: number;
};

const pendingPlayerJoins = new Map<string, PendingPlayerJoin>();


const playerSessionOperations = new Map<string, Promise<void>>();

Hooks.once("init", () => {
  CONFIG.debug.hooks = false;

  const localGame = game as Game;
  registerSettings(localGame);
});

Hooks.once("ready", async () => {
  const localGame = game as Game;

  OpenAPI.BASE = LIVE_API_BASE;
  //OpenAPI.BASE = LOCAL_API_BASE;


  registerApiKeySocket(localGame);
  if (localGame.user && !localGame.user.isGM) {
    startClientApiKeyWatcher(localGame);
  }
  if (localGame.user?.isGM) {
    registerGameSessionHooksForGM(localGame);
  }

  const ownApiKey = await promptApiKey(localGame);
  if (ownApiKey) {
    OpenAPI.TOKEN = ownApiKey;
  }

  if (localGame.user?.isGM) {
    if (isPrimaryActiveGM(localGame) && ownApiKey) {
      await safelyCreateGameSession(localGame, localGame.user, ownApiKey);
    }
  }
});

function startClientApiKeyWatcher(localGame: Game): void {
  let lastAnnouncedKey: string | undefined;

  const announceWhenKeyAvailable = () => {
    const user = localGame.user;
    if (!user || user.isGM) return;

    const currentKey = getOwnApiKey(localGame);
    if (!currentKey) {
      lastAnnouncedKey = undefined;
      return;
    }
    if (lastAnnouncedKey === currentKey) return;

    const socket = getFoundrySocket();
    if (!socket) return;

    lastAnnouncedKey = currentKey;
    socket.emit(SOCKET_NAME, {
      type: "client-socket-ready",
      userId: user.id,
    } satisfies ApiKeySocketMessage);
    console.log(`[DD] Client ready for API key requests: ${user.name}`);
  };

  announceWhenKeyAvailable();
  window.setInterval(announceWhenKeyAvailable, CLIENT_KEY_WATCH_INTERVAL_MS);
}

function registerApiKeySocket(localGame: Game): void {
  const socket = getFoundrySocket();

  if (!socket) {
    console.warn("Foundry socket is not available.");
    return;
  }

  socket.on(SOCKET_NAME, async (message: ApiKeySocketMessage) => {
    const currentUser = localGame.user;
    if (!currentUser) return;

    if (message.type === "client-socket-ready") {
      if (!currentUser.isGM || !isPrimaryActiveGM(localGame)) return;
      const joiningUser = localGame.users?.get(message.userId);
      if (!joiningUser || joiningUser.id === currentUser.id) return;
      console.log(`[DD] Player module ready: ${joiningUser.name}`);
      markPlayerReady(localGame, joiningUser);
      return;
    }

    if (message.type === "request-client-ready") {
      if (message.targetUserId !== currentUser.id) return;
      const requestingUser = localGame.users?.get(message.requestingUserId);
      if (!requestingUser?.isGM) return;
      if (!getOwnApiKey(localGame)) return;
      socket.emit(SOCKET_NAME, {
        type: "client-socket-ready",
        userId: currentUser.id,
      } satisfies ApiKeySocketMessage);
      return;
    }

    if (message.type === "request-api-key") {
      if (message.targetUserId !== currentUser.id) return;
      const requestingUser = localGame.users?.get(message.requestingUserId);
      if (!requestingUser?.isGM) {
        console.warn(`[DD] Ignoring API key request from non-GM: ${message.requestingUserId}`);
        return;
      }

      console.log(`[DD] Received API key request from GM for ${currentUser.name}`);
      const apiKey = getOwnApiKey(localGame);

      socket.emit(SOCKET_NAME, {
        type: "api-key-response",
        requestId: message.requestId,
        targetUserId: currentUser.id,
        apiKey,
      } satisfies ApiKeySocketMessage);
      console.log(`[DD] Sent API key response (has key: ${Boolean(apiKey)})`);
      return;
    }

    if (message.type === "api-key-response") {
      if (!currentUser.isGM) return;

      const pending = pendingApiKeyRequests.get(message.requestId);
      if (!pending) return;

      window.clearTimeout(pending.timeoutId);
      pendingApiKeyRequests.delete(message.requestId);

      if (message.error) {
        console.warn(
          `API key request failed for user ${message.targetUserId}: ${message.error}`,
        );
        pending.resolve(undefined);
        return;
      }

      console.log(`[DD] Received API key response for ${message.targetUserId} (has key: ${Boolean(message.apiKey)})`);
      pending.resolve(message.apiKey);
    }
  });
}


function registerGameSessionHooksForGM(localGame: Game): void {
  Hooks.on("userConnected", (user: User, connected: boolean) => {
    if (!localGame.user?.isGM || !isPrimaryActiveGM(localGame)) return;
    if (user.id === localGame.user.id) return;

    if (connected) {
      trackPlayerConnection(localGame, user);
      return;
    }

    const state = pendingPlayerJoins.get(user.id);
    if (state) {
      pendingPlayerJoins.delete(user.id); 
      cancelJoinTimers(state);
    }

    queuePlayerSessionOperation(user.id, async () => {
      const apiKey = activeSessionApiKeys.get(user.id) ?? getOwnApiKey(localGame);
      if (!apiKey) {
        console.warn(`[DD] Cannot log leave for ${user.name}: no cached or GM API key.`);
        return;
      }
      await updateGameSession(localGame, user, apiKey, false);
    });
  });

  const alreadyConnectedUsers =
    localGame.users?.filter((user: User) => user.active) ?? [];
  for (const user of alreadyConnectedUsers) {
    if (user.id !== localGame.user?.id) {
      trackPlayerConnection(localGame, user);
    }
  }
}

function trackPlayerConnection(localGame: Game, user: User): void {
  let state = pendingPlayerJoins.get(user.id);
  if (!state) {
    state = {
      ready: false,
      queued: false,
      completed: false,
      keyAttempts: 0,
      joinedAt: new Date().toISOString(),
      fallbackDue: false,
    };
    const thisConnection = state;
    pendingPlayerJoins.set(user.id, state);
    state.fallbackTimer = window.setTimeout(() => {
      if (pendingPlayerJoins.get(user.id) !== thisConnection || thisConnection.completed) return;
      thisConnection.fallbackDue = true;
      console.warn(
        `[DD] ${user.name} did not provide a usable API key within 3 minutes. ` +
          "Using the primary GM's key for session logging.",
      );
      schedulePlayerJoin(localGame, user, thisConnection);
    }, PLAYER_KEY_GRACE_PERIOD_MS);

    requestClientReadiness(localGame, user.id, state);
  }
  if (state.ready || state.fallbackDue) schedulePlayerJoin(localGame, user, state);
}

function requestClientReadiness(
  localGame: Game,
  userId: string,
  state: PendingPlayerJoin,
): void {
  if (
    pendingPlayerJoins.get(userId) !== state ||
    state.ready || state.completed || state.fallbackDue
  ) return;

  getFoundrySocket()?.emit(SOCKET_NAME, {
    type: "request-client-ready",
    targetUserId: userId,
    requestingUserId: localGame.user?.id ?? "",
  } satisfies ApiKeySocketMessage);
  state.readyTimer = window.setTimeout(
    () => requestClientReadiness(localGame, userId, state),
    CLIENT_READY_RETRY_MS,
  );
}

function markPlayerReady(localGame: Game, user: User): void {
  trackPlayerConnection(localGame, user);
  const state = pendingPlayerJoins.get(user.id);
  if (!state || state.completed) return;
  state.ready = true;
  if (state.readyTimer !== undefined) window.clearTimeout(state.readyTimer);
  state.readyTimer = undefined;
  schedulePlayerJoin(localGame, user, state);
}

function schedulePlayerJoin(
  localGame: Game,
  user: User,
  state: PendingPlayerJoin,
): void {
  if ((!state.ready && !state.fallbackDue) || state.completed || state.queued) return;
  if (pendingPlayerJoins.get(user.id) !== state) return;

  state.queued = true;
  state.debounceTimer = window.setTimeout(() => {
    state.debounceTimer = undefined;
    queuePlayerSessionOperation(user.id, async () => {
      let retryNeeded = false;
      try {
        if (pendingPlayerJoins.get(user.id) !== state) return;
        const gmFallbackKey = state.fallbackDue ? getOwnApiKey(localGame) : undefined;
        let playerApiKey: string | undefined;
        if (state.ready && !gmFallbackKey) {
          playerApiKey = await requestApiKeyFromUser(
            localGame,
            user.id,
            PLAYER_KEY_RESPONSE_TIMEOUT_MS,
          );
        }
        if (pendingPlayerJoins.get(user.id) !== state) return;

        const apiKey = gmFallbackKey ?? playerApiKey;

        if (!apiKey) {
          state.keyAttempts++;
          retryNeeded = true;
          if (state.fallbackDue) {
            console.warn(
              `[DD] Cannot apply 3-minute fallback for ${user.name}: ` +
                "primary GM has no API key set yet. Retrying.",
            );
          } else if (state.keyAttempts % 3 === 0) {
            console.warn(
              `[DD] Still waiting for ${user.name}'s API key ` +
                `(${state.keyAttempts} attempts; GM fallback after 3 minutes).`,
            );
          }
          return;
        }
        if (gmFallbackKey) {
          console.log(`[DD] Logging ${user.name} using primary GM's fallback key.`);
        }
        const sessionIds = getStoredGameSessionIds(localGame);
        if (sessionIds[user.id]) {
          await updateGameSession(localGame, user, apiKey, true, state.joinedAt);
        } else {
          await createGameSession(localGame, user, apiKey, state.joinedAt);
        }
        state.completed = true;
        cancelJoinTimers(state);
      } catch (error) {
        console.error(`[DD] Failed to log join for ${user.name}:`, error);
        retryNeeded = true;
      } finally {
        state.queued = false;
        if (retryNeeded && pendingPlayerJoins.get(user.id) === state && !state.completed) {
          state.keyRetryTimer = window.setTimeout(
            () => schedulePlayerJoin(localGame, user, state),
            PLAYER_KEY_RETRY_MS,
          );
        }
      }
    });
  }, 250);
}

function cancelJoinTimers(state: PendingPlayerJoin): void {
  if (state.fallbackTimer !== undefined) window.clearTimeout(state.fallbackTimer);
  if (state.readyTimer !== undefined) window.clearTimeout(state.readyTimer);
  if (state.debounceTimer !== undefined) window.clearTimeout(state.debounceTimer);
  if (state.keyRetryTimer !== undefined) window.clearTimeout(state.keyRetryTimer);
}

function queuePlayerSessionOperation(userId: string, work: () => Promise<void>): void {
  const previous = playerSessionOperations.get(userId) ?? Promise.resolve();
  const next = previous
    .then(work)
    .catch((error: unknown) => {
      console.error(`[DD] Failed session operation for user ${userId}:`, error);
    });
  playerSessionOperations.set(userId, next);
  void next.then(() => {
    if (playerSessionOperations.get(userId) === next) {
      playerSessionOperations.delete(userId);
    }
  });
}

function requestApiKeyFromUser(
  localGame: Game,
  targetUserId: string,
  timeoutMs = 10_000,
): Promise<string | undefined> {
  const currentUserId = localGame.user?.id;

  if (!currentUserId) {
    console.warn("Cannot request API key: current user is missing.");
    return Promise.resolve(undefined);
  }

  const socket = getFoundrySocket();
  if (!socket) {
    console.warn("[DD] Cannot request API key: Foundry socket missing.");
    return Promise.resolve(undefined);
  }

  const requestId = makeRequestId();
  console.log(`[DD] Requesting API key from user ${targetUserId}`);

  return new Promise((resolve) => {
    const timeoutId = window.setTimeout(() => {
      pendingApiKeyRequests.delete(requestId);
      console.warn(
        `Timed out waiting for API key response from user ${targetUserId}.`,
      );
      resolve(undefined);
    }, timeoutMs);

    pendingApiKeyRequests.set(requestId, {
      resolve,
      timeoutId,
    });

    socket.emit(SOCKET_NAME, {
      type: "request-api-key",
      requestId,
      targetUserId,
      requestingUserId: (game as Game).user?.id ?? "",
    } satisfies ApiKeySocketMessage);
  });
}

async function promptApiKey(
  localGame: Game,
): Promise<string | undefined> {
  const key = getOwnApiKey(localGame);

  if (key) {
    return key;
  }

  return showApiKeyDialog(localGame);
}

function getOwnApiKey(localGame: Game): string | undefined {
  const key = localGame.settings.get(MODULE_ID, "api-key") as
    | string
    | undefined;
  const trimmedKey = key?.trim();

  return trimmedKey ? trimmedKey : undefined;
}

function showApiKeyDialog(localGame: Game): Promise<string | undefined> {
  return new Promise((resolve) => {
    let resolved = false;

    const finish = (key: string | undefined) => {
      if (resolved) return;
      resolved = true;
      resolve(key);
    };

    new Dialog({
      title: "Enter API Key",
      content: `
        <form>
          <div class="form-group">
            <label>API Key</label>
            <input type="password" name="apiKey" placeholder="API key" />
          </div>
          <p class="notes">
            This is temporary. Your key is saved as a client setting on this browser.
          </p>
        </form>
      `,
      buttons: {
        save: {
          icon: '<i class="fas fa-save"></i>',
          label: "Save",
          callback: async (html: JQuery) => {
            const key = String(
              html.find('input[name="apiKey"]').val() ?? "",
            ).trim();

            if (!key) {
              finish(undefined);
              return;
            }

            try {
              await localGame.settings.set(MODULE_ID, "api-key", key);
              OpenAPI.TOKEN = key;
              finish(key);
            } catch (error) {
              console.error("[DD] Error while saving API key setting:", error);
              finish(getOwnApiKey(localGame));
            }
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Later",
          callback: () => finish(undefined),
        },
      },
      default: "save",
      close: () => finish(undefined),
    }).render(true);
  });
}

function isPrimaryActiveGM(localGame: Game): boolean {
  const currentUserId = localGame.user?.id;
  if (!currentUserId) return false;

  return isPrimaryActiveGMId(localGame, currentUserId);
}

function isPrimaryActiveGMId(localGame: Game, userId: string): boolean {
  const activeGms =
    localGame.users
      ?.filter((u: User) => u.isGM && u.active)
      .sort((a: User, b: User) => a.id.localeCompare(b.id)) ?? [];

  return activeGms[0]?.id === userId;
}

async function safelyCreateGameSession(
  localGame: Game,
  user: User,
  apiKey: string,
): Promise<void> {
  try {
    await createGameSession(localGame, user, apiKey);
  } catch (error) {
    console.error("Failed to create own Foundry game session:", error);
  }
}

async function createGameSession(
  localGame: Game,
  user: User,
  apiKey: string,
  joinedAt = new Date().toISOString(),
): Promise<void> {
  const world = localGame.world as unknown as FoundryWorldWithTitle;

  const payload = {
    foundry_user_id: user.id,
    foundry_user_name: user.name,
    foundry_world_id: world.id,
    foundry_world_name: world.title,
    joined_at: joinedAt,
  };

  console.log("Sending create game session payload:", payload);

  const response = await fetch(`${OpenAPI.BASE}/api/v1/game-sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Create game session failed response:", errorText);

    throw new Error(
      `Create game session failed: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  const data = (await response.json()) as CreateGameSessionResponse;

  const sessionIds = getStoredGameSessionIds(localGame);
  sessionIds[user.id] = data.id;
  setStoredGameSessionIds(localGame, sessionIds);

  activeSessionApiKeys.set(user.id, apiKey);

  console.log(`Logged join for ${user.name}. Game session id: ${data.id}`);
}

async function updateGameSession(
  localGame: Game,
  user: User,
  apiKey: string,
  connected: boolean,
  joinedAt = new Date().toISOString(),
): Promise<void> {
  const sessionIds = getStoredGameSessionIds(localGame);
  const sessionId = sessionIds[user.id];
  const eventName = connected ? "join" : "leave";

  if (!sessionId) {
    if (connected) {
      console.warn(
        `No stored game session id found for ${user.name}; creating a new session instead of updating join.`,
      );
      await createGameSession(localGame, user, apiKey, joinedAt);
      return;
    }

    console.warn(
      `No stored game session id found for ${user.name}; cannot log leave event.`,
    );
    return;
  }

  const body = connected
    ? {
        joined_at: joinedAt,
        status: "connected",
      }
    : {
        left_at: new Date().toISOString(),
        status: "disconnected",
      };

  const response = await fetch(
    `${OpenAPI.BASE}/api/v1/game-sessions/${sessionId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Update game session failed response:", errorText);

    throw new Error(
      `Update game session failed: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  if (connected) {
    activeSessionApiKeys.set(user.id, apiKey);
  } else {
    delete sessionIds[user.id];
    setStoredGameSessionIds(localGame, sessionIds);
    activeSessionApiKeys.delete(user.id);
  }

  console.log(`Logged ${eventName} for ${user.name}. Game session id: ${sessionId}`,  );
}

function getStoredGameSessionIds(localGame: Game): Record<string, string> {
  const worldId = localGame.world?.id ?? "unknown-world";
  const storageKey = `${MODULE_ID}.game-session-ids.${worldId}`;

  return JSON.parse(localStorage.getItem(storageKey) ?? "{}");
}

function setStoredGameSessionIds(
  localGame: Game,
  sessionIds: Record<string, string>,
): void {
  const worldId = localGame.world?.id ?? "unknown-world";
  const storageKey = `${MODULE_ID}.game-session-ids.${worldId}`;

  localStorage.setItem(storageKey, JSON.stringify(sessionIds));
}

function makeRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

registerSoundHooks();
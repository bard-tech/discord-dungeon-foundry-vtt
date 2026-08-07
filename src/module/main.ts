import { OpenAPI } from "../generated/discord-dungeon-api";
import { registerSettings } from "./settings";
import { registerSoundHooks } from "./sound-hooks";

const MODULE_ID = "discord-dungeon-foundry-vtt";
const SOCKET_NAME = `module.${MODULE_ID}`;

//const LOCAL_API_BASE = "http://localhost:3001";
 const LIVE_API_BASE = import.meta.env.VITE_DISCORD_DUNGEON_BASE_URL;
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

  const ownApiKey = await promptApiKey(localGame);
  if (ownApiKey) {
    OpenAPI.TOKEN = ownApiKey;
  }

  if (localGame.user.isGM) {
    registerGameSessionHooksForGM(localGame);

    if (isPrimaryActiveGM(localGame) && localGame.user && ownApiKey) {
      await safelyCreateGameSession(localGame, localGame.user, ownApiKey);
    }
  }
});

function registerApiKeySocket(localGame: Game): void {
  const socket = getFoundrySocket();

  if (!socket) {
    console.warn("Foundry socket is not available.");
    return;
  }

  socket.on(SOCKET_NAME, async (message: ApiKeySocketMessage) => {
    const currentUser = localGame.user;
    if (!currentUser) return;

    if (message.type === "request-api-key") {
      if (message.targetUserId !== currentUser.id) return;

      if (!isPrimaryActiveGMId(localGame, message.requestingUserId)) {
        console.warn(
          `Ignoring API key request from non-primary-GM user id: ${message.requestingUserId}`,
        );
        return;
      }

      const apiKey = await promptApiKey(localGame);

      getFoundrySocket().emit(SOCKET_NAME, {
        type: "api-key-response",
        requestId: message.requestId,
        targetUserId: currentUser.id,
        apiKey,
      } satisfies ApiKeySocketMessage);

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

      pending.resolve(message.apiKey);
    }
  });
}

function registerGameSessionHooksForGM(localGame: Game): void {
  Hooks.on("userConnected", async (user: User, connected: boolean) => {
    if (!localGame.user.isGM) return;
    if (!isPrimaryActiveGM(localGame)) return;

    await sleep(10);

    try {
      if (connected) {
        const playerApiKey = await requestApiKeyFromUser(localGame, user.id);
        const dmApiKey = getOwnApiKey(localGame);
        const apiKey = playerApiKey ?? dmApiKey;

        if (!apiKey) {
          console.warn(
            `Could not log join for ${user.name}: no player API key and no GM fallback key.`,
          );
          return;
        }

        const sessionIds = getStoredGameSessionIds(localGame);

        if (sessionIds[user.id]) {
          await updateGameSession(localGame, user, apiKey, true);
        } else {
          await createGameSession(localGame, user, apiKey);
        }

        return;
      } else {
        const apiKey =
          activeSessionApiKeys.get(user.id) ?? getOwnApiKey(localGame);

        if (!apiKey) {
          console.warn(
            `Could not log leave for ${user.name}: no cached player API key and no GM fallback key.`,
          );
          return;
        }

        await updateGameSession(localGame, user, apiKey, false);
      }
    } catch (error) {
      console.error("Failed to log Foundry game session event:", error);
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

  const requestId = makeRequestId();

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

    getFoundrySocket()?.emit(SOCKET_NAME, {
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

            await localGame.settings.set(MODULE_ID, "api-key", key);
            OpenAPI.TOKEN = key;
            finish(key);
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
): Promise<void> {
  const world = localGame.world as unknown as FoundryWorldWithTitle;

  const payload = {
    foundry_user_id: user.id,
    foundry_user_name: user.name,
    foundry_world_id: world.id,
    foundry_world_name: world.title,
    joined_at: new Date().toISOString(),
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
): Promise<void> {
  const sessionIds = getStoredGameSessionIds(localGame);
  const sessionId = sessionIds[user.id];
  const eventName = connected ? "join" : "leave";

  if (!sessionId) {
    if (connected) {
      console.warn(
        `No stored game session id found for ${user.name}; creating a new session instead of updating join.`,
      );
      await createGameSession(localGame, user, apiKey);
      return;
    }

    console.warn(
      `No stored game session id found for ${user.name}; cannot log leave event.`,
    );
    return;
  }

  const body = connected
    ? {
        joined_at: new Date().toISOString(),
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

  console.log(
    `Logged ${eventName} for ${user.name}. Game session id: ${sessionId}`,
  );
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

registerSoundHooks();

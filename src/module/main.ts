import { OpenAPI } from '../generated/discord-dungeon-api';
import { registerSettings } from './settings';
import { registerSoundHooks } from './sound-hooks';


Hooks.on("init", () => {
  CONFIG.debug.hooks = false;
});


Hooks.on("ready", function() {
  const localGame = game as Game;
  registerSettings(localGame);
  OpenAPI.BASE = import.meta.env.VITE_DISCORD_DUNGEON_BASE_URL;
  //OpenAPI.BASE = "http://localhost:3001";
  const key = localGame.settings.get("discord-dungeon-foundry-vtt", "api-key") as string | undefined;
  if (key !== undefined && key !== "")  {
    OpenAPI.TOKEN = key;
  }
  if (!key) {
    showApiKeyDialog(localGame);
  }
  if (localGame.user.isGM) {
    registerGameSessionHooksGM(localGame, localGame.user, true)
  }
  registerGameSessionHooks(localGame);
});


function showApiKeyDialog(game: Game) {
  new Dialog({
    title: "Enter API Key",
    content: `
      <form>
        <div class="form-group">
          <label>API Key</label>
          <input type="text" name="apiKey" placeholder="API key" />
        </div>
      </form>
    `,
    buttons: {
      save: {
        icon: '<i class="fas fa-save"></i>',
        label: "Save",
        callback: async (html: JQuery) => {
          const key = String(html.find('input[name="apiKey"]').val() ?? "");
          await game.settings.set("discord-dungeon-foundry-vtt", "api-key", key);
          OpenAPI.TOKEN = key;
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Later"
      }
    },
  }).render(true);
}


async function registerGameSessionHooksGM(localGame: Game, user: User, connected: boolean) {
    if (!localGame.user?.isGM) return;
    if (!isPrimaryActiveGM(localGame)) return;
    const key = localGame.settings.get("discord-dungeon-foundry-vtt", "api-key") as string | undefined;
    if (!key) {
      console.warn("Cannot log game session event: missing API key.");
      return;
    }
    OpenAPI.TOKEN = key;
    OpenAPI.BASE = "http://localhost:3001";
    try {
      if (connected) {
        await createGameSession(localGame, user, key);
      } else {
        await updateGameSession(localGame, user, key);
      }
    } catch (error) {
      console.error("Failed to log Foundry game session event:", error);
    }
}


function registerGameSessionHooks(localGame: Game) {
  Hooks.on("userConnected", async (user: User, connected: boolean) => {
    if (!localGame.user?.isGM) return;
    if (!isPrimaryActiveGM(localGame)) return;
    const key = localGame.settings.get("discord-dungeon-foundry-vtt", "api-key") as string | undefined;
    if (!key) {
      console.warn("Cannot log game session event: missing API key.");
      return;
    }
    OpenAPI.TOKEN = key;
    OpenAPI.BASE = "http://localhost:3001";
    try {
      if (connected) {
        await createGameSession(localGame, user, key);
      } else {
        await updateGameSession(localGame, user, key);
      }
    } catch (error) {
      console.error("Failed to log Foundry game session event:", error);
    }
  });
}


function isPrimaryActiveGM(localGame: Game): boolean {
  const activeGms = localGame.users
    ?.filter((u: User) => u.isGM && u.active)
    .sort((a: User, b: User) => a.id.localeCompare(b.id));

  return activeGms?.[0]?.id === localGame.user?.id;
}


async function createGameSession(
  localGame: Game,
  user: User,
  apiKey: string
): Promise<void> {
  const payload = {
    foundry_user_id: user.id,
    foundry_user_name: user.name,
    foundry_world_id: localGame.world.id,
    foundry_world_name: (localGame.world as unknown as { title: string }).title,  //This title property works but for some reason is not recognized by my code. EDIT: this fixing it? thanks GPT.
    joined_at: new Date().toISOString(),
    key: apiKey
  };
  console.log("Sending create game session payload:", payload);
  const response = await fetch(`${OpenAPI.BASE}/api/v1/game-sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Create game session failed response:", errorText);

    throw new Error(
      `Create game session failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }
  const data = await response.json() as CreateGameSessionResponse;
  const sessionIds = getStoredGameSessionIds(localGame);
  sessionIds[user.id] = data.id;
  setStoredGameSessionIds(localGame, sessionIds);
  console.log(`Logged join for ${user.name}. Game session id: ${data.id}`);
}


type CreateGameSessionResponse = {
  id: string;
};


async function updateGameSession(
  localGame: Game,
  user: User,
  apiKey: string
): Promise<void> {
  const sessionIds = getStoredGameSessionIds(localGame);
  const sessionId = sessionIds[user.id];
  if (!sessionId) {
    console.warn(`No stored game session id found for ${user.name}; cannot log leave event.`);
    return;
  }
  const response = await fetch(`${OpenAPI.BASE}/api/v1/game-sessions/${sessionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      left_at: new Date().toISOString(),
      status: "disconnected"
    })
  });
if (!response.ok) {
  const errorText = await response.text();
  console.error("Create game session failed response:", errorText);
  throw new Error(
    `Create game session failed: ${response.status} ${response.statusText} - ${errorText}`
  );
}
  delete sessionIds[user.id];
  setStoredGameSessionIds(localGame, sessionIds);
  console.log(`Logged leave for ${user.name}. Game session id: ${sessionId}`);
}


function getStoredGameSessionIds(localGame: Game): Record<string, string> {
  const worldId = localGame.world?.id ?? "unknown-world";
  const storageKey = `${"discord-dungeon-foundry-vtt"}.game-session-ids.${worldId}`;
  return JSON.parse(localStorage.getItem(storageKey) ?? "{}");
}


function setStoredGameSessionIds(
  localGame: Game,
  sessionIds: Record<string, string>
): void {
  const worldId = localGame.world?.id ?? "unknown-world";
  const storageKey = `${"discord-dungeon-foundry-vtt"}.game-session-ids.${worldId}`;
  localStorage.setItem(storageKey, JSON.stringify(sessionIds));
}


registerSoundHooks();
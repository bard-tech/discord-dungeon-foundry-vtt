import { OpenAPI } from '../generated/discord-dungeon-api';
import { registerSettings } from './settings';
import { registerSoundHooks } from './sound-hooks';


Hooks.on("init", () => {
  CONFIG.debug.hooks = false;
});

Hooks.on("ready", function() {
  const localGame = game as Game;
  registerSettings(localGame);
  const key = localGame.settings.get("discord-dungeon-foundry-vtt", "api-key") as string | undefined;
  if (key !== undefined && key !== "")  {
    OpenAPI.TOKEN = key;
    OpenAPI.BASE = import.meta.env.VITE_DISCORD_DUNGEON_BASE_URL;
  }
});

registerSoundHooks();
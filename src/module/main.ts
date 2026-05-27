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
    //OpenAPI.BASE = import.meta.env.VITE_DISCORD_DUNGEON_BASE_URL;
    OpenAPI.BASE ="http://localhost:3001"; //for local set up.
  }
  if (localGame.user?.isGM) return;
  if (key) return;
  showApiKeyDialog(localGame);
});



Hooks.once("init", () => {
  const localGame = game as Game;
  localGame.settings.register("discord-dungeon-foundry-vtt", "api-key", {
    name: "API Key",
    hint: "API key.",
    scope: "client",
    config: true,
    default: ""
  });
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
/*ok, so for now we have a button that lets clients enter their API key, but i dont think this is doing anything. 
Unless we can have that Game session manager come over here and play sounds in this area. Or at the very least,
we can have it make a game session by ID instead of by discord
*/



registerSoundHooks();
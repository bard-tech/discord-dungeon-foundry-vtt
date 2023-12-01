import { debouncedReload } from './util';

import { OpenAPI } from "../generated/discord-dungeon-api";


export function registerSettings(game: Game) {
  game.settings.register("discord-dungeon-foundry-vtt", "api-key", {
    name: "API Key",
    hint: "The discord dungeon api key.",
    scope: "world",
    config: true,
    type: String,
    default: "",
    onChange: _value => {
      game.settings.set("discord-dungeon-foundry-vtt", "sound-triggering-user", game.user?.id);
      // Per https://foundryvtt.wiki/en/development/api/settings this is safer than using the value passed in
      OpenAPI.TOKEN = game.settings.get("discord-dungeon-foundry-vtt", "api-key") as string;
    }
  });
  game.settings.register("discord-dungeon-foundry-vtt", "backend", {
    name: "Sound Backend",
    hint: "Backend used for playing sounds.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "bard-bot": "Bard Bot",
    //   "foundry": "Foundry"
    } as Record<string, string>,
    default: "bard-bot",
    onChange: _value => {
      debouncedReload();
    }
  });

  game.settings.register("discord-dungeon-foundry-vtt", "sound-triggering-user", {
    name: "Sound Triggering User",
    hint: "User who will send sounds to the discord dungeon API",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });
}

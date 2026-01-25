import { OpenAPI, UserResponse } from '../generated/discord-dungeon-api';
import { registerSettings } from './settings';
import { registerSoundHooks } from './sounds/sound-hooks';


Hooks.on("init", () => {
  CONFIG.debug.hooks = false;
});

const discordDungeonUserApiKeyFlagName = "discord-dungeon-user-api-key";
const discordDungeonUserAccessKeyFlagName = "discord-dungeon-user-access-key";


const notLoggedInMessage = `Discord Dungeon allows you to customize the sounds played for your characters.
To link your account log in to <a target="_blank" rel="noopener noreferrer" href="https://discorddungeon.com">discord dungeon</a> 
in another tab in the same browser, refresh this page, and click accept to complete the link!
`


Hooks.on("ready", async function() {
  const localGame = game as Game;
  registerSettings(localGame);
  // safe since we're in the ready handler
  const foundryUser = localGame.user!
  console.log(`Discord Dungeon VTT | User: ${foundryUser.name} (${foundryUser.id})`);

  if (foundryUser.getFlag("discord-dungeon-foundry-vtt", discordDungeonUserApiKeyFlagName) === undefined) {
    await fetch(`${import.meta.env.VITE_DISCORD_DUNGEON_BASE_URL}/api/v1/me`, {method: "GET", mode: "cors", credentials: "include"})
      .then(async response => {
        
        if (response.status === 401 || response.status === 403) {
          const isLoginPromptMuted = await localGame.user?.getFlag("discord-dungeon-foundry-vtt", "account-link-login-prompt-muted") ?? false;
          if (isLoginPromptMuted) {
            return
          }
          showLoginDialogBox(localGame);

          return
        }

        const isLinkAccountPromptMuted = await localGame.user?.getFlag("discord-dungeon-foundry-vtt", "account-link-connect-user-muted") ?? false;
        if (isLinkAccountPromptMuted) {
          return
        }

        const myDialogOptions = {
          height: 175,
        };

        const userData: UserResponse = await response.json();
        console.log(`Discord Dungeon VTT | User Data: ${JSON.stringify(userData)}`)
        new Dialog({
          title: "Discord Dungeon VTT | Link Account",
          content: `You are logged in to discord dungeon as ${userData.discord_username}. Would you like to connect this foundry user profile to that discord dungeon account?`,
          buttons: {
            link: {
              label: "Link Account",
              callback: async () => { 
                const userAPIKey = await (await fetch(`${import.meta.env.VITE_DISCORD_DUNGEON_BASE_URL}/api/v1/generate-api-key`)).text()
                await localGame.user?.setFlag("discord-dungeon-foundry-vtt", discordDungeonUserApiKeyFlagName, userAPIKey);
              },
              icon: `<i class="fas fa-check"></i>`
            },
            mute: {
              label: "Mute for 30 days",
              callback: async () => { await localGame.user?.setFlag("discord-dungeon-foundry-vtt", "account-link-connect-user-muted", true); },
              icon: `<i class="fas fa-x"></i>`
            }
          }
        }, myDialogOptions).render(true);

      }).catch(err => {
        console.error(err);
      });
  }

  // generate access token for the user and save as a user flag
  const userAPIKey = foundryUser.getFlag("discord-dungeon-foundry-vtt", discordDungeonUserApiKeyFlagName) as string | undefined;
  if (userAPIKey !== undefined && userAPIKey !== "") {
    fetch(`${import.meta.env.VITE_DISCORD_DUNGEON_BASE_URL}/api/v1/get-access-token`, {
      headers: { "Authorization": `Bearer ${userAPIKey}` }
    }).then(async (resp) => {
      const token = await resp.text();
      foundryUser.setFlag("discord-dungeon-foundry-vtt", "discord-dungeon-user-access-token", token);
    });
  }

  const key = localGame.settings.get("discord-dungeon-foundry-vtt", discordDungeonUserAccessKeyFlagName) as string | undefined;
  if (key !== undefined && key !== "")  {
    OpenAPI.BASE = import.meta.env.VITE_DISCORD_DUNGEON_BASE_URL;
    // generate an access token
    fetch(`${import.meta.env.VITE_DISCORD_DUNGEON_BASE_URL}/api/v1/get-access-token`).then(async (resp) => {
      const token = await resp.text();
      OpenAPI.TOKEN = token;
    });

    OpenAPI.TOKEN = key;
  }
});

registerSoundHooks();

function showLoginDialogBox(localGame: Game) {
  const myDialogOptions = {
    height: 175,
  };

  new Dialog({
    title: "Discord Dungeon VTT | Log In",
    content: notLoggedInMessage,
    buttons: {
      mute: {
        // TODO figure out a reasonable way users can unmute this
        label: "Mute for 30 days",
        callback: async () => { await localGame.user?.setFlag("dsicord-dungeon-foundry-vtt", "account-link-login-prompt-muted", true); },
        //icon: `<i class="fas fa-times"></i>`
      }
    }
  }, myDialogOptions).render(true);
}

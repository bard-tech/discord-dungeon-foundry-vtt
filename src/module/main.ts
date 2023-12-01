import { OpenAPI, DefaultService as DiscordDungeonApi } from '../generated/discord-dungeon-api';
import { registerSettings } from './settings';
import { DndAction, currentUserIsSoundTriggeringUser, fullSkillName } from './util';

Hooks.on("init", () => {
  CONFIG.debug.hooks = true;
});

Hooks.on("ready", function() {
  const localGame = game as Game;
  registerSettings(localGame);
  const key = localGame.settings.get("discord-dungeon-foundry-vtt", "api-key") as string | undefined;
  if (key !== undefined && key !== "" && currentUserIsSoundTriggeringUser())  {
    OpenAPI.TOKEN = key;
    OpenAPI.BASE = import.meta.env.VITE_DISCORD_DUNGEON_BASE_URL;
  }
});

Hooks.on("dnd5e.useItem", async function(item: Item) {
  if (item.type === "weapon") {
    const action: DndAction = { Attack: { weapon: item.name!, attacker_name: item.actor?.name!} };
    await DiscordDungeonApi.postApiV1DndEvent({
      dnd_actions: [action]
    });
    console.log(`An attack was made with a ${item.name}!`);
  } else if (item.type === "spell") {
    const action: DndAction = { Cast: { spell: item.name!, caster_name: item.actor?.name!} };
    await DiscordDungeonApi.postApiV1DndEvent({
      dnd_actions: [action]
    });
    console.log(`${item.name} was cast!`);
  } 
});

Hooks.on("dnd5e.rollAttack", async function(item: Item, roll: Roll) {
  if (!currentUserIsSoundTriggeringUser()) { 
    return;
  }

  if (item.type === "weapon" || item.type === "spell") {
    const rollAction: DndAction = { AttackRoll: { total: roll.total!, d20_roll: roll.dice[0].results[0].result, attacker_name: item.actor?.name!} };
    await DiscordDungeonApi.postApiV1DndEvent({
      dnd_actions: [rollAction]
    });
  }
});

Hooks.on("dnd5e.rollSkill", async function(actor: Actor, roll: Roll, skillAbrev: string) {
  if (!currentUserIsSoundTriggeringUser()) { 
    return;
  }
  
  console.log(`${actor.name} rolled a ${roll.total} on their ${skillAbrev} skill!`);
  const d20_roll = roll.dice[0].results.filter(d => d.discarded === undefined || !d.discarded)[0].result;
  const check_action: DndAction = { AbilityCheck: { ability: fullSkillName(skillAbrev), total: roll.total!, d20_roll: d20_roll, character_name: actor.name!} };
  await DiscordDungeonApi.postApiV1DndEvent({
    dnd_actions: [check_action]
  });
});

Hooks.on("dnd5e.rollAbilityTest", async function(actor: Actor, roll: Roll, skillAbrev: string) {
  if (!currentUserIsSoundTriggeringUser()) { 
    return;
  }

  console.log(`${actor.name} rolled a ${roll.total} on their ${skillAbrev} skill!`);
  const d20_roll = roll.dice[0].results.filter(d => d.discarded === undefined || !d.discarded)[0].result;
  const check_action: DndAction = { AbilityCheck: { ability: fullSkillName(skillAbrev), total: roll.total!, d20_roll: d20_roll, character_name: actor.name!} };
  await DiscordDungeonApi.postApiV1DndEvent({
    dnd_actions: [check_action]
  });
});

Hooks.on("dnd5e.rollAbilitySave", async function(actor: Actor, roll: Roll, skillAbrev: string) {
  if (!currentUserIsSoundTriggeringUser()) { 
    return;
  }

  console.log(`${actor.name} rolled a ${roll.total} on their ${skillAbrev} save!`);
  const d20_roll = roll.dice[0].results.filter(d => d.discarded === undefined || !d.discarded)[0].result;
  const save_action: DndAction = { SavingThrow: { save: fullSkillName(skillAbrev), total: roll.total!, d20_roll: d20_roll, character_name: actor.name!} };
  await DiscordDungeonApi.postApiV1DndEvent({
    dnd_actions: [save_action]
  });
});
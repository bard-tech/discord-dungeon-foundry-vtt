import { OpenAPI, DefaultService as DiscordDungeonApi } from '../generated/discord-dungeon-api';
import { registerSettings } from './settings';
import { DndAction, fullSkillName } from './util';

type Item5e = Item & {
  hasAttack: boolean;
  hasDamage: boolean;
  hasIndividualTarget: boolean;
  hasAreaTarget: boolean;
}

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

Hooks.on("dnd5e.useItem", async function(item: Item5e) {
  if (item.type === "weapon" && !item.hasAttack && (!item.hasDamage || item.hasAreaTarget)) {
    const action: DndAction = { Attack: { weapon: item.name!, attacker_name: item.actor?.name!} };
    await DiscordDungeonApi.postApiV1DndEvent({
      dnd_actions: [action]
    });
    console.log(`Discord Dungeon VTT | An attack was made with a ${item.name}!`);
  } else if (item.type === "spell" && !item.hasAttack && (!item.hasDamage || item.hasAreaTarget)) {
    const action: DndAction = { Cast: { spell: item.name!, caster_name: item.actor?.name!} };
    await DiscordDungeonApi.postApiV1DndEvent({
      dnd_actions: [action]
    });
    console.log(`Discord Dungeon VTT | ${item.name} was cast!`);
  } 
});

Hooks.on("dnd5e.rollAttack", async function(item: Item5e, roll: Roll) {
  if (item.type === "weapon" && item.hasAttack) {
    const action: DndAction = { Attack: { weapon: item.name!, attacker_name: item.actor?.name!} };
    await DiscordDungeonApi.postApiV1DndEvent({
      dnd_actions: [action]
    });
    console.log(`Discord Dungeon VTT | An attack was made with a ${item.name}!`);
  } else if (item.type === "spell" && item.hasAttack) {
    const action: DndAction = { Cast: { spell: item.name!, caster_name: item.actor?.name!} };
    await DiscordDungeonApi.postApiV1DndEvent({
      dnd_actions: [action]
    });
    console.log(`Discord Dungeon VTT | ${item.name} was cast!`);
  } 

  if (item.type === "weapon" || item.type === "spell") {
    const rollAction: DndAction = { AttackRoll: { total: roll.total!, d20_roll: roll.dice[0].results[0].result, attacker_name: item.actor?.name!} };
    await DiscordDungeonApi.postApiV1DndEvent({
      dnd_actions: [rollAction]
    });
  }
});

Hooks.on("dnd5e.rollDamage", async function(item: Item5e, _roll: Roll) {
  if (item.type === "weapon" && !item.hasAttack && !item.hasAreaTarget && item.hasDamage) {
    const action: DndAction = { Attack: { weapon: item.name!, attacker_name: item.actor?.name!} };
    await DiscordDungeonApi.postApiV1DndEvent({
      dnd_actions: [action]
    });
    console.log(`Discord Dungeon VTT | An attack was made with a ${item.name}!`);
  } else if (item.type === "spell" && !item.hasAttack && !item.hasAreaTarget && item.hasDamage) {
    const action: DndAction = { Cast: { spell: item.name!, caster_name: item.actor?.name!} };
    await DiscordDungeonApi.postApiV1DndEvent({
      dnd_actions: [action]
    });
    console.log(`Discord Dungeon VTT | ${item.name} was cast!`);
  } 
});

Hooks.on("dnd5e.rollSkill", async function(actor: Actor, roll: Roll, skillAbrev: string) {
  const d20_roll = roll.dice[0].results.filter(d => d.discarded === undefined || !d.discarded)[0].result;
  const check_action: DndAction = { AbilityCheck: { ability: fullSkillName(skillAbrev), total: roll.total!, d20_roll: d20_roll, character_name: actor.name!} };
  await DiscordDungeonApi.postApiV1DndEvent({
    dnd_actions: [check_action]
  });
  console.log(`Discord Dungeon VTT | ${actor.name} rolled a ${roll.total} on their ${skillAbrev} skill!`);
});

Hooks.on("dnd5e.rollAbilityTest", async function(actor: Actor, roll: Roll, skillAbrev: string) {
  const d20_roll = roll.dice[0].results.filter(d => d.discarded === undefined || !d.discarded)[0].result;
  const check_action: DndAction = { AbilityCheck: { ability: fullSkillName(skillAbrev), total: roll.total!, d20_roll: d20_roll, character_name: actor.name!} };
  await DiscordDungeonApi.postApiV1DndEvent({
    dnd_actions: [check_action]
  });
  console.log(`Discord Dungeon VTT | ${actor.name} rolled a ${roll.total} on their ${skillAbrev} skill!`);
});

Hooks.on("dnd5e.rollAbilitySave", async function(actor: Actor, roll: Roll, skillAbrev: string) {
  const d20_roll = roll.dice[0].results.filter(d => d.discarded === undefined || !d.discarded)[0].result;
  const save_action: DndAction = { SavingThrow: { save: fullSkillName(skillAbrev), total: roll.total!, d20_roll: d20_roll, character_name: actor.name!} };
  await DiscordDungeonApi.postApiV1DndEvent({
    dnd_actions: [save_action]
  });
  console.log(`Discord Dungeon VTT | ${actor.name} rolled a ${roll.total} on their ${skillAbrev} save!`);
});
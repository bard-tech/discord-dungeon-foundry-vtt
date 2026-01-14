import { DndAction, fullSkillName } from "./util";
import { DefaultService as DiscordDungeonApi } from "../generated/discord-dungeon-api";
//import { D20Roll } from "foundryvtt-dnd5e-types";
//Use type _____ = any;
/*
type Item5e = Item & {
  hasAttack: boolean;
  hasDamage: boolean;
  hasIndividualTarget: boolean;
  hasAreaTarget: boolean;
};
*/
type Item5e = any;


function soundsEnabled() {
  const localGame = game as any;
  const enabled = localGame.settings.get("discord-dungeon-foundry-vtt", "playing-enabled") as Boolean | undefined;

  return enabled ?? true;
}

export function registerSoundHooks() {
  Hooks.on("dnd5e.useItem", async function (item: Item5e) {
    if (!soundsEnabled()) {
      return;
    }

    if (
      item.type === "weapon" &&
      !item.hasAttack &&
      (!item.hasDamage || item.hasAreaTarget)
    ) {
      const action: DndAction = {
        Attack: { weapon: item.name!, attacker_name: item.actor.name! },
      };
      console.log(action)
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [action],
      });
      console.log(
        `Discord Dungeon VTT | An attack was made with a ${item.name}!`
      );
    } else if (
      item.type === "spell" &&
      !item.hasAttack &&
      (!item.hasDamage || item.hasAreaTarget)
    ) {
      const action: DndAction = {
        Cast: { spell: item.name!, caster_name: item.actor.name! },
      };
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [action],
      });
      console.log(`Discord Dungeon VTT | ${item.name} was cast!`);
    }
  });

  Hooks.on("combatStart", async function (combat: any, config: any) {
    if (!soundsEnabled()) {
      return;
    }
    console.log(
        `Discord Dungeon VTT saw an Combat Start!`
      );
      const action: DndAction = "BeginInitiative";
      combat;
      config;
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [action],
      });
    }
  );

  Hooks.on("combatTurnChange", async function (combat: any, config: any) {
    if (!soundsEnabled()) {
      return;
    }
    console.log(
        `Discord Dungeon VTT saw an Combat Turn change!`
      );
      combat;
      config;
      const character_name = "phil"
      const action: DndAction = {
        NextInitiative: {character_name},
      };
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [action],
      });
    }
  );

  Hooks.on("deleteCombat", async function (combat: any, config: any) {
    if (!soundsEnabled()) {
      return;
    }
    console.log(
        `Discord Dungeon VTT saw an Combat End!`
      );
      const action: DndAction = "EndInitiative";
      combat;
      config;
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [action],
      });
    }
  );  
  Hooks.on("dnd5e.rollInitiative", async function (actor5e: any, config: any) {
    if (!soundsEnabled()) {
      return;
    }
    console.log(
        `Discord Dungeon VTT saw an Initiative roll!`
      );
      const character_name = "phil";
      const action: DndAction = {
        JoinInitiative: {character_name},
      };
      actor5e;
      config;
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [action],
      });
    }
  );  
  Hooks.on("dnd5e.rollAttack", async function (D20Rolls: any, config: any) {
    if (!soundsEnabled()) {
      return;
    }
    console.log(
        `Discord Dungeon VTT  saw an attack!`
      );
    const activity = config.subject;
    const item = activity.item ?? activity.parent ?? config.item;
    const actor = item.actor ?? config.actor ?? activity.actor;
    if (item.type === "weapon" && item.hasAttack) {
      console.log(
        `Discord Dungeon VTT  saw an attack with weapon!`
      );
      const action: DndAction = {
        Attack: { weapon: item.name!, attacker_name: actor.name! },
      };
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [action],
      });
      console.log(
        `Discord Dungeon VTT | An attack was made with a ${item.name}!`
      );
    } else if (item.type === "spell" && item.hasAttack) {
      const action: DndAction = {
        Cast: { spell: item.name!, caster_name: actor.name! },
      };
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [action],
      });
      console.log(`Discord Dungeon VTT | ${item.name} was cast!`);
    }
    const roll = Array.isArray(D20Rolls) ? D20Rolls[0] : D20Rolls;
    if (item.type === "weapon" || item.type === "spell") {
      const rollAction: DndAction = {
        AttackRoll: {
          total: roll.total!,
          d20_roll: roll.dice[0].results[0].result,
          attacker_name: actor.name || "Unknown attacker",
        },
      };
      console.log(
        `Discord Dungeon VTT | The roll was ${roll.dice[0]?.results[0]?.result}!`
      );
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [rollAction],
      });
    }
  });
/*
  Hooks.on("dnd5e.rollDamage", async function (D20Rolls: any, item: any) {
    if (!soundsEnabled()) {
      return;
    }

    if (
      item.type === "weapon" &&
      !item.hasAttack &&
      !item.hasAreaTarget &&
      item.hasDamage
    ) {
      const action: DndAction = {
        Attack: { weapon: item.name!, attacker_name: item.actor?.name! },
      };
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [action],
      });
      console.log(
        `Discord Dungeon VTT | An attack was made with a ${item.name}!`
      );
    } else if (
      item.type === "spell" &&
      !item.hasAttack &&
      !item.hasAreaTarget &&
      item.hasDamage
    ) {
      const action: DndAction = {
        Cast: { spell: item.name!, caster_name: item.actor?.name! },
      };
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [action],
      });
      console.log(`Discord Dungeon VTT | ${D20Rolls} ${item.name} was cast!`);
    }
  });
*/
  Hooks.on(
    "dnd5e.rollSkill",
    async function (actor: Actor, roll: Roll, skillAbrev: string) {
      if (!soundsEnabled()) {
        return;
      }

      const d20_roll = roll.dice[0].results.filter(
        (d) => d.discarded === undefined || !d.discarded
      )[0].result;
      const check_action: DndAction = {
        AbilityCheck: {
          ability: fullSkillName(skillAbrev),
          total: roll.total!,
          d20_roll: d20_roll,
          character_name: actor.name!,
        },
      };
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [check_action],
      });
      console.log(
        `Discord Dungeon VTT | ${actor.name} rolled a ${roll.total} on their ${skillAbrev} skill!`
      );
    }
  );

  Hooks.on(
    "dnd5e.rollAbilityTest",
    async function (actor: Actor, roll: Roll, skillAbrev: string) {
      if (!soundsEnabled()) {
        return;
      }

      const d20_roll = roll.dice[0].results.filter(
        (d) => d.discarded === undefined || !d.discarded
      )[0].result;
      const check_action: DndAction = {
        AbilityCheck: {
          ability: fullSkillName(skillAbrev),
          total: roll.total!,
          d20_roll: d20_roll,
          character_name: actor.name!,
        },
      };
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [check_action],
      });
      console.log(
        `Discord Dungeon VTT | ${actor.name} rolled a ${roll.total} on their ${skillAbrev} skill!`
      );
    }
  );

  Hooks.on(
    "dnd5e.rollAbilitySave",
    async function (actor: Actor, roll: Roll, skillAbrev: string) {
      if (!soundsEnabled()) {
        return;
      }

      const d20_roll = roll.dice[0].results.filter(
        (d) => d.discarded === undefined || !d.discarded
      )[0].result;
      const save_action: DndAction = {
        SavingThrow: {
          save: fullSkillName(skillAbrev),
          total: roll.total!,
          d20_roll: d20_roll,
          character_name: actor.name!,
        },
      };
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [save_action],
      });
      console.log(
        `Discord Dungeon VTT | ${actor.name} rolled a ${roll.total} on their ${skillAbrev} save!`
      );
    }
  );
}

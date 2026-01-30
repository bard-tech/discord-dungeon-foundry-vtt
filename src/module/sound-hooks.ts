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


function soundsEnabled() {
  const localGame = game as any;
  const enabled = localGame.settings.get("discord-dungeon-foundry-vtt", "playing-enabled") as boolean | undefined;

  return enabled ?? true;
}

export function registerSoundHooks() {
/*
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
*/

  Hooks.on("combatStart", async function () {
    if (!soundsEnabled()) {
      return;
    }
    console.log(
        `Discord Dungeon VTT saw an Combat Start!`
      );
      const action: DndAction = "BeginInitiative";
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [action],
      });
    }
  );

  Hooks.on("combatTurnChange", async function (combat5e: any) {
    if (!soundsEnabled()) {
      return;
    }
      const notStart = combat5e.previous.turn;
      const character_name = combat5e.combatant.name
      console.log(
        `Discord Dungeon VTT saw a Combat Turn change to ${character_name}! `
      );
      if (notStart != null) {
        const action: DndAction = {
          NextInitiative: {character_name},
        };
        await DiscordDungeonApi.postApiV1DndEvent({
          dnd_actions: [action],
        });
      }

    }
  );

  Hooks.on("deleteCombat", async function () {
    if (!soundsEnabled()) {
      return;
    }
    console.log(
        `Discord Dungeon VTT saw an Combat End!`
      );
      const action: DndAction = "EndInitiative";
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [action],
      });
    }
  );

  Hooks.on("dnd5e.rollInitiative", async function (Actor:any) {
    if (!soundsEnabled()) {
      return;
    }
      const character_name = Actor.name;
      console.log(
        `Discord Dungeon VTT saw an Initiative roll! from ${character_name}`
        );
      const action: DndAction = {
        JoinInitiative: {character_name},
      };
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
    const weapon = item.name;
    const attacker_name = actor.name;
    if (item.type === "weapon" && item.hasAttack) {
      const action: DndAction = {
        Attack: { weapon, attacker_name},
      };
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [action],
      });
      console.log(
        `Discord Dungeon VTT | An attack by ${attacker_name} was made with a ${weapon}!`
      );
    } else if (item.type === "spell" && item.hasAttack) {
      const action: DndAction = {
        Cast: { spell: item.name!, caster_name: actor.name! },
      };
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [action],
      });
      console.log(`Discord Dungeon VTT | ${item.name} was cast by ${attacker_name}!`);
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

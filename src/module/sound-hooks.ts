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
  const enabled = localGame.settings.get(
    "discord-dungeon-foundry-vtt",
    "playing-enabled",
  ) as boolean | undefined;

  return enabled ?? true;
}

export function registerSoundHooks() {
 //Each hook on skill has been updated to newest dnd 5e on foundry
  Hooks.on("combatStart", async function () {
    if (!soundsEnabled()) {
      return;
    }
    const action: DndAction = "BeginInitiative";
    await DiscordDungeonApi.postApiV1DndEvent({
      dnd_actions: [action],
    });
  });

  Hooks.on("combatTurnChange", async function (combat5e: any) {
    if (!soundsEnabled()) {
      return;
    }
    const notStart = combat5e.previous.turn;
    const character_name = combat5e.combatant.name;
    if (notStart != null) {
      const action: DndAction = {
        NextInitiative: { character_name },
      };
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [action],
      });
    }
  });

  Hooks.on("deleteCombat", async function () {
    if (!soundsEnabled()) {
      return;
    }
    const action: DndAction = "EndInitiative";
    await DiscordDungeonApi.postApiV1DndEvent({
      dnd_actions: [action],
    });
  });

  Hooks.on("dnd5e.rollInitiative", async function (Actor: any) {
    if (!soundsEnabled()) {
      return;
    }
    const character_name = Actor.name;
    const action: DndAction = {
      JoinInitiative: { character_name },
    };
    await DiscordDungeonApi.postApiV1DndEvent({
      dnd_actions: [action],
    });
  });

  Hooks.on("dnd5e.rollAttack", async function (D20Rolls: any, config: any) {
    if (!soundsEnabled()) {
      return;
    }
    console.log(`Discord Dungeon VTT  saw an attack!`);
    const activity = config.subject;
    const item = activity.item;
    const weapon = item.name;
    const name = item.actor.name;
    if (item.type === "weapon" && item.hasAttack) {
      const action: DndAction = {
        Attack: { weapon, attacker_name: name },
      };
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [action],
      });
    } else if (item.type === "spell" && item.hasAttack) {
      const action: DndAction = {
        Cast: { spell: item.name!, caster_name: name! },
      };
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [action],
      });
    }
    const roll = Array.isArray(D20Rolls) ? D20Rolls[0] : D20Rolls;
    if (item.type === "weapon" || item.type === "spell") {
      const rollAction: DndAction = {
        AttackRoll: {
          total: roll.total!,
          d20_roll: roll.dice[0].results[0].result,
          attacker_name: name || "Unknown attacker",
        },
      };
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [rollAction],
      });
    }
  });

  Hooks.on("dnd5e.rollSkill", async function (D20Rolls: any, config: any) {
    if (!soundsEnabled()) {
        return;
    }
    const activity = config.subject;
    const skillAbrev = config.skill;
    const name = activity.name;
    const roll = Array.isArray(D20Rolls) ? D20Rolls[0] : D20Rolls;
    const check_action: DndAction = {
      AbilityCheck: {
        ability: fullSkillName(skillAbrev),
        total: roll.total!,
        d20_roll: roll.dice[0].results[0].result,
        character_name: name!,
      },
    };
    await DiscordDungeonApi.postApiV1DndEvent({
      dnd_actions: [check_action],
    });
  });

  Hooks.on("dnd5e.rollSavingThrow", async function (D20Rolls: any, config: any) {
    if (!soundsEnabled()) {
      return;
    }
    const activity = config.subject;
    const skillAbrev = config.ability;
    const name = activity.name;
    const roll = Array.isArray(D20Rolls) ? D20Rolls[0] : D20Rolls;
    const save_action: DndAction = {
      SavingThrow: {
        save: fullSkillName(skillAbrev),
        total: roll.total!,
        d20_roll: roll.dice[0].results[0].result,
        character_name: name!,
      },
    };
    await DiscordDungeonApi.postApiV1DndEvent({
      dnd_actions: [save_action],
    });
  });
}

import { DndAction, fullSkillName } from "./util";
import { DefaultService as DiscordDungeonApi } from "../generated/discord-dungeon-api";
function soundsEnabled() {
  const localGame = game as any;
  const enabled = localGame.settings.get(
    "discord-dungeon-foundry-vtt",
    "playing-enabled",
  ) as boolean | undefined;

  return enabled ?? true;
}

export function registerSoundHooks() {

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
    const isNotFirstTurn = combat5e.previous.turn !== null;
    const character_name = combat5e.combatant.name;
    if (isNotFirstTurn === true) {
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

  Hooks.on("dnd5e.rollInitiative", async function (actor: any) {
    if (!soundsEnabled()) {
      return;
    }
    const character_name = actor.name;
    const action: DndAction = {
      JoinInitiative: { character_name },
    };
    await DiscordDungeonApi.postApiV1DndEvent({
      dnd_actions: [action],
    });
  });

  Hooks.on("dnd5e.rollAttack", async function (D20Rolls: any, attackInfo: any) {
    if (!soundsEnabled()) {
      return;
    }
    const activity = attackInfo.subject;
    const item = activity.item;
    const name = item.actor.name;
    if (item.type === "weapon" && item.hasAttack) {
      const action: DndAction = {
        Attack: { weapon: item.name, attacker_name: name },
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
          d20_roll: roll.dice[0].total,
          attacker_name: name!,
        },
      };
      await DiscordDungeonApi.postApiV1DndEvent({
        dnd_actions: [rollAction],
      });
    }
  });

  Hooks.on("dnd5e.rollSkill", async function (D20Rolls: any, skillInfo: any) {
    if (!soundsEnabled()) {
        return;
    }
    const skillAbrev = skillInfo.skill;
    const name = skillInfo.subject.name;
    const roll = Array.isArray(D20Rolls) ? D20Rolls[0] : D20Rolls;
    const check_action: DndAction = {
      AbilityCheck: {
        ability: fullSkillName(skillAbrev),
        total: roll.total!,
        d20_roll: roll.dice[0].total,
        character_name: name!,
      },
    };
    await DiscordDungeonApi.postApiV1DndEvent({
      dnd_actions: [check_action],
    });
  });

  Hooks.on("dnd5e.rollSavingThrow", async function (D20Rolls: any, saveInfo: any) {
    if (!soundsEnabled()) {
      return;
    }
    const skillAbrev = saveInfo.ability;
    const name = saveInfo.subject.name;
    const roll = Array.isArray(D20Rolls) ? D20Rolls[0] : D20Rolls;
    const save_action: DndAction = {
      SavingThrow: {
        save: fullSkillName(skillAbrev),
        total: roll.total!,
        d20_roll: roll.dice[0].total,
        character_name: name!,
      },
    };
    await DiscordDungeonApi.postApiV1DndEvent({
      dnd_actions: [save_action],
    });
  });
}

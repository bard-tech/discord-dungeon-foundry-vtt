import { DndAction, fullSkillName } from "../util";
import { SoundHandler } from "./sound-interface";
import { DiscordSoundHandler } from "./discord-sound";
import { FoundrySoundHandler } from "./foundry-sound";

type Item5e = Item & {
  hasAttack: boolean;
  hasDamage: boolean;
  hasIndividualTarget: boolean;
  hasAreaTarget: boolean;
};

function soundsEnabled() {
  const localGame = game as Game;
  const enabled = localGame.settings.get("discord-dungeon-foundry-vtt", "playing-enabled") as Boolean | undefined;

  return enabled ?? true;
}

let SOUND_HANDLER: SoundHandler;
export function getSoundHandler() {
  if (SOUND_HANDLER === undefined) {
    initializeSoundHandler();
  }

  return SOUND_HANDLER
}

export function initializeSoundHandler() {
  const localGame = game as Game;
  const handlerType = localGame.settings.get("discord-dungeon-foundry-vtt", "backend") as String | undefined;
  console.log(`Discord Dungeon VTT | Initializing ${handlerType} sound handler`)
  switch (handlerType) {
    case "bard-bot":
      SOUND_HANDLER = new DiscordSoundHandler();
      break;
    case "foundry":
      SOUND_HANDLER = new FoundrySoundHandler()
      break;
  }
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
        Attack: { weapon: item.name!, attacker_name: item.actor?.name! },
      };
      getSoundHandler().play([action])
      console.log(
        `Discord Dungeon VTT | An attack was made with a ${item.name}!`
      );
    } else if (
      item.type === "spell" &&
      !item.hasAttack &&
      (!item.hasDamage || item.hasAreaTarget)
    ) {
      const action: DndAction = {
        Cast: { spell: item.name!, caster_name: item.actor?.name! },
      };
      getSoundHandler().play([action])
      console.log(`Discord Dungeon VTT | ${item.name} was cast!`);
    }
  });

  Hooks.on("dnd5e.rollAttack", async function (item: Item5e, roll: Roll) {
    if (!soundsEnabled()) {
      return;
    }

    if (item.type === "weapon" && item.hasAttack) {
      const action: DndAction = {
        Attack: { weapon: item.name!, attacker_name: item.actor?.name! },
      };
      getSoundHandler().play([action])
      console.log(
        `Discord Dungeon VTT | An attack was made with a ${item.name}!`
      );
    } else if (item.type === "spell" && item.hasAttack) {
      const action: DndAction = {
        Cast: { spell: item.name!, caster_name: item.actor?.name! },
      };
      getSoundHandler().play([action])
      console.log(`Discord Dungeon VTT | ${item.name} was cast!`);
    }

    if (item.type === "weapon" || item.type === "spell") {
      const rollAction: DndAction = {
        AttackRoll: {
          total: roll.total!,
          d20_roll: roll.dice[0].results[0].result,
          attacker_name: item.actor?.name!,
        },
      };
      getSoundHandler().play([rollAction])
    }
  });

  Hooks.on("dnd5e.rollDamage", async function (item: Item5e, _roll: Roll) {
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
      getSoundHandler().play([action])
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
      getSoundHandler().play([action])
      console.log(`Discord Dungeon VTT | ${item.name} was cast!`);
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
      getSoundHandler().play([check_action])
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
      getSoundHandler().play([check_action])
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
      getSoundHandler().play([save_action])
      console.log(
        `Discord Dungeon VTT | ${actor.name} rolled a ${roll.total} on their ${skillAbrev} save!`
      );
    }
  );
}


export function fullSkillName(skillAbrev: string): string {
  switch (skillAbrev) {
    case "acr": return "acrobatics";
    case "ani": return "animal Handling";
    case "arc": return "arcana";
    case "ath": return "athletics";
    case "dec": return "deception";
    case "his": return "history";
    case "ins": return "insight";
    case "itm": return "intimidation";
    case "inv": return "investigation";
    case "med": return "medicine";
    case "nat": return "nature";
    case "prc": return "perception";
    case "prf": return "performance";
    case "per": return "persuasion";
    case "rel": return "religion";
    case "slt": return "sleight of Hand";
    case "ste": return "stealth";
    case "sur": return "survival";
    case "str": return "strength";
    case "dex": return "dexterity";
    case "con": return "constitution";
    case "int": return "intelligence";
    case "wis": return "wisdom";
    case "cha": return "charisma";
    default: return skillAbrev;
  }
}export function currentUserIsSoundTriggeringUser() {
  const g = game as Game;
  const currentUserIsSoundTriggeringUser = g.user?.id === g.settings.get("discord-dungeon-foundry-vtt", "sound-triggering-user");
  return currentUserIsSoundTriggeringUser;
}
export const debouncedReload = foundry.utils.debounce(() => window.location.reload(), 100);
export type DndAction = "BeginInitiative" |
//"JoinInitiative" |
//"NextInitiative"|
"EndInitiative"|
{ JoinInitiative: { character_name: string; }; } |
{ NextInitiative: { character_name: string; }; } |
{ BeginInitiative}|
{ Attack: { weapon: string; attacker_name: string; }; } |
{ AttackRoll: { total: number; d20_roll: number; attacker_name: string; }; } |
{ Cast: { spell: string; caster_name: string; }; } |
{ AbilityCheck: { ability: string; total: number; d20_roll: number; character_name: string; }; } |
{ SavingThrow: { save: string; total: number; d20_roll: number; character_name: string; }; };


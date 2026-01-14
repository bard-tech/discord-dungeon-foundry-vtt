
export function fullSkillName(skillAbrev: string): string {
  switch (skillAbrev) {
    case "acr": return "Acrobatics";
    case "ani": return "Animal Handling";
    case "arc": return "Arcana";
    case "ath": return "Athletics";
    case "dec": return "Deception";
    case "his": return "History";
    case "ins": return "Insight";
    case "itm": return "Intimidation";
    case "inv": return "Investigation";
    case "med": return "Medicine";
    case "nat": return "Nature";
    case "prc": return "Perception";
    case "prf": return "Performance";
    case "per": return "Persuasion";
    case "rel": return "Religion";
    case "slt": return "Sleight of Hand";
    case "ste": return "Stealth";
    case "sur": return "Survival";
    case "str": return "Strength";
    case "dex": return "Dexterity";
    case "con": return "Constitution";
    case "int": return "Intelligence";
    case "wis": return "Wisdom";
    case "cha": return "Charisma";
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


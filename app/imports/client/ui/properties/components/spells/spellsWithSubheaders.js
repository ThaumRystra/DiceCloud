export default function spellsWithSubheaders(spells = []){
  let result = [];
  let lastSpell = undefined;
  let sortedSpells = [...spells].sort((a, b) => a.level - b.level)
  sortedSpells.forEach(spell => {
    if (spell.isSubheader) return;
    if (!lastSpell || spell.level > lastSpell.level){
      result.push({
        isSubheader: true,
        level: spell.level,
      });
    }
    result.push(spell);
    lastSpell = spell;
  });
  return result;
}

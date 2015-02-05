var spellLevels = [
    { name: "Cantrips", level: 0 },
    { name: "Level 1", level: 1, attribute: "level1SpellSlots" },
    { name: "Level 2", level: 2, attribute: "level2SpellSlots" },
    { name: "Level 3", level: 3, attribute: "level3SpellSlots" },
    { name: "Level 4", level: 4, attribute: "level4SpellSlots" },
    { name: "Level 5", level: 5, attribute: "level5SpellSlots" },
    { name: "Level 6", level: 6, attribute: "level6SpellSlots" },
    { name: "Level 7", level: 7, attribute: "level7SpellSlots" },
    { name: "Level 8", level: 8, attribute: "level8SpellSlots" },
    { name: "Level 9", level: 9, attribute: "level9SpellSlots" },
];

Template.spells.helpers({
    spellLevels: function(){
        return spellLevels;
    },
    spellsAtLevel: function(){
        return Spells.find( {charId: Template.parentData()._id, level: this.level} )
    }
})
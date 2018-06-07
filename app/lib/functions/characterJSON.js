JSONExport = function(charId) {
  var character = {
    "attacks": Attacks.find({charId: charId}).fetch(),
    "characters": Characters.find({_id: charId}).fetch(),
    "classes": Classes.find({charId: charId}).fetch(),
    "containers": Containers.find({charId: charId}).fetch(),
    "effects": Effects.find({charId: charId}).fetch(),
    "experience": Experiences.find({charId: charId}).fetch(),
    "features": Features.find({charId: charId}).fetch(),
    "items": Items.find({charId: charId}).fetch(),
    "notes": Notes.find({charId: charId}).fetch(),
    "proficiencies": Proficiencies.find({charId: charId}).fetch(),
    "spellLists": SpellLists.find({charId: charId}).fetch(),
    "spells": Spells.find({charId: charId}).fetch()
  };
  return JSON.stringify(character);
}

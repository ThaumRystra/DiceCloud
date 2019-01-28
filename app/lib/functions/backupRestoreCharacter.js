let characterCollections = [
  Actions,
  Attacks,
  Buffs,
  Classes,
  CustomBuffs,
  Effects,
  Experiences,
  Features,
  Notes,
  Proficiencies,
  SpellLists,
  Items,
  Containers,
];

function backupCharacter(charId){
  let characterDump = {};
  characterDump.characters = [Characters.findOne(charId)];
  characterCollections.map(
    c => characterDump[c._name] = c.find({charId}).fetch()
  );
  return characterDump;
};

function restoreCharacter(characterDump){
  for (collectionName in characterDump){
    let collection = Meteor.Collection.get(collectionName);
    for (doc in characterDump[collectionName]){
      collection.insert(doc);
    }
  }
};

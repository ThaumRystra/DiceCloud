let characterCollections = [
  Actions,
  Attacks,
  Buffs,
  Classes,
  Conditions,
  CustomBuffs,
  Effects,
  Experiences,
  Features,
  Notes,
  Proficiencies,
  SpellLists,
  Spells,
  TemporaryHitPoints,
  Items,
  Containers,
];

function dumpCharacter(charId){
  let characterDump = {};
  characterDump.character = Characters.findOne(charId);
  characterCollections.forEach(c =>  {
    characterDump.collections[c._name] = c.find({charId}).fetch();
  });
  return characterDump;
};

function giveCharacterDumpNewIds(characterDump){
  // Give the character a new Id
  const newCharId = Random.id();
  characterDump.character._id = newCharId;

  // Give all documents a new Id, and store the mapping from old to new
  let idMap = {}; // {oldId: newId}
  for (let colName in characterDump.collections){
    for (let doc of characterDump.collections[colName]){
      let oldId = doc._id;
      let newId = Random.id();
      doc._id = newId;
      idMap[oldId] = newId;
    }
  }

  // Replace all references to old Ids with new ones
  for (let colName in characterDump.collections){
    for (let doc of characterDump.collections[colName]){
      // Replace the character Id with the new one
      doc.charId = newCharId;
      // Replace the parent reference id with a new id
      if (doc.parent && doc.parent.id){
        let newParentId = idMap[doc.parent.id];
        if(!newParentId) throw `Can't find the mapping for id ${doc.parent.id}`;
        doc.parent.id = newParentId;
      }
    }
  }
}

function restoreCharacter(characterDump){
  Characters.insert(characterDump.character);
  for (collectionName in characterDump.collections){
    let collection = Meteor.Collection.get(collectionName);
    for (doc in characterDump[collectionName]){
      collection.insert(doc);
    }
  }
};

import { saveAs } from 'file-saver';

let characterCollections = [];
Meteor.startup(() => {
  characterCollections = [
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
});

dumpCharacter = function(charId){
  let characterDump = {collections: {}};
  characterDump.character = Characters.findOne(charId);
  characterCollections.forEach(c =>  {
    characterDump.collections[c._name] = c.find({charId}).fetch();
  });
  return characterDump;
};

saveCharacterDump = function(charId){
  let dump = dumpCharacter(charId);
  let textDump = JSON.stringify(dump, null, 2);
  let charName = dump.character.name;
  let blob = new Blob([textDump], {type: "application/json;charset=utf-8"});
  saveAs(blob, `${charName}.JSON`);
};

giveCharacterDumpNewIds = function(characterDump){
  // Give the character a new Id
  const oldCharId = characterDump.character._id;
  const newCharId = Random.id();
  characterDump.character._id = newCharId;

  let idMap = {[oldCharId]: newCharId}; // {oldId: newId}

  // Give all documents a new Id, and store the mapping from old to new
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

restoreCharacter = function(characterDump){
  Characters.insert(characterDump.character);
  for (collectionName in characterDump.collections){
    let collection = Meteor.Collection.get(collectionName);
    for (doc in characterDump[collectionName]){
      collection.insert(doc);
    }
  }
};

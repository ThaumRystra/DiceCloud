import {
  assertEditPermission as editPermission,
  assertViewPermission as viewPermission,
  assertOwnership as ownership
} from '/imports/api/sharing/sharingPermissions.js';

function getCreature(creature, fields){
  if (typeof creature === 'string'){
    return Creatures.findOne(id, {fields});
  } else {
    return creature;
  }
}

export function assertOwnership(creature, userId){
  creature = getCreature(creature, {owner: 1});
  ownership(creature, userId);
}

export function assertEditPermission(creature, userId) {
  creature = getCreature(creature, {owner: 1, writers: 1});
  editPermission(creature, userId);
};

export function assertViewPermission(creature, userId) {
  creature = getCreature(creature, {owner: 1, writers: 1, public: 1});
  viewPermission(creature, userId);
};

// Checks if the method has permission to run on the document. If the document
// has a charId, that creature is checked, otherwise if it has an _id and the
// collection is defined in the method options, that document is fetched to
// determine its charId, otherwise a getCharId method can be defined to perform
// a special search for the required creature
export function creaturePermissionMixin(methodOptions){
  let assertPermission;
  if (methodOptions.permission === 'owner'){
    assertPermission = assertOwnership;
  } else if (methodOptions.permission === 'edit'){
    assertPermission = assertEditPermission;
  } else if (methodOptions.permission === 'view'){
    assertPermission = assertViewPermission;
  } else {
    throw "`permission` missing in method options";
  }

  let getCharId;
  if (methodOptions.getCharId){
    getCharId = methodOptions.getCharId
  } else if (methodOptions.collection) {
    getCharId = function({_id}){
      methodOptions.collection.findOne(_id, {
        fields: {charId: 1}
      }).charId;
    };
  } else {
    getCharId = function(){
      throw "`getCharId` or `collection` missing in method options," +
      " or {charId} missing in call";
    }
  }

  let runFunc = methodOptions.run;
  methodOptions.run = function(doc, ...rest){
    // Store the charId on the doc for other mixins if it had to be fetched
    doc.charId = doc.charId || getCharId.apply(this, arguments);
    assertPermission(charId, this.userId)
    return runFunc.call(this, doc, ...rest);
  };
  return methodOptions;
};

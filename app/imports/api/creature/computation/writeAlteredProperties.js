import { Meteor } from 'meteor/meteor'
import { isEqual, forOwn } from 'lodash';
import { ComputedOnlySkillSchema } from '/imports/api/properties/Skills.js';
import { ComputedOnlyAttributeSchema } from '/imports/api/properties/Attributes.js';
import { ComputedOnlyEffectSchema } from '/imports/api/properties/Effects.js';
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';

export default function writeAlteredProperties(memo){
  let bulkWriteOperations = [];
  // Loop through all properties on the memo
  forOwn(memo.originalPropsById, (original, _id) => {
    let changed = memo.propsById[_id];

    let schema;
    switch (changed.type){
      case 'skill':
        schema = ComputedOnlySkillSchema;
        break;
      case 'attribute':
        schema = ComputedOnlyAttributeSchema;
        break;
      case 'effect':
        schema = ComputedOnlyEffectSchema;
        break;
    }
    let op = undefined;
    // Loop through all keys that can be changed by computation
    // and compile an operation that sets all those keys
    for (let key of schema.objectKeys()){
      if (!isEqual(original[key], changed[key])){
        if (!op) op = newOperation(_id, changed.type);
        let value = changed[key];
        // Use null instead of undefined because it works with the $set operator
        if (value === undefined) value = null;
        op.updateOne.update.$set[key] = value;
      }
    }
    if (op){
      bulkWriteOperations.push(op);
    }
  });
  bulkWriteProperties(bulkWriteOperations);
}

function newOperation(_id, type){
  let newOp = {
    updateOne: {
      filter: {_id},
      update: {'$set': {}},
    }
  };
  if (Meteor.isClient){
    newOp.type = type;
  }
  return newOp;
}

function bulkWriteProperties(bulkWriteOps){
  if (!bulkWriteOps.length) return;
  if (Meteor.isServer){
    CreatureProperties.rawCollection().bulkWrite(
      bulkWriteOps,
      {ordered : false},
      function(e){
        if (e) console.error(e);
      }
    );
  } else {
    bulkWriteOps.forEach(op => {
      CreatureProperties.update(op.updateOne.filter, op.updateOne.update, {
        // The server code is bypassing collection 2 validation, so do the same
        // on the client
        // include this if bypass is off:
        // selector: {type: op.type}
        bypassCollection2: true,
      });
    });
  }
}

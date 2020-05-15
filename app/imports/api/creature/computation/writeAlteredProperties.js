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
      default:
        return;
    }
    let op = undefined;
    // Loop through all keys that can be changed by computation
    // and compile an operation that sets all those keys
    for (let key of schema.objectKeys()){
      if (!isEqual(original[key], changed[key])){
        if (!op) op = newOperation(_id, changed.type);
        let value = changed[key];
        if (value === undefined){
          // Unset values that become undefined
          addUnsetOp(op, key);
        } else {
          // Set values that changed to something else
          addSetOp(op, key, value);
        }
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
      update: {},
    }
  };
  if (Meteor.isClient){
    newOp.type = type;
  }
  return newOp;
}

function addSetOp(op, key, value){
  if (op.updateOne.update.$set){
    op.updateOne.update.$set[key] = value;
  } else {
    op.updateOne.update.$set = {[key]: value};
  }
}

function addUnsetOp(op, key){
  if (op.updateOne.update.$unset){
    op.updateOne.update.$unset[key] = 1;
  } else {
    op.updateOne.update.$unset = {[key]: 1};
  }
}

function bulkWriteProperties(bulkWriteOps){
  if (!bulkWriteOps.length) return;
  if (Meteor.isServer){
    CreatureProperties.rawCollection().bulkWrite(
      bulkWriteOps,
      {ordered : false},
      function(e){
        if (e) {
          console.error('Bulk write failed: ');
          console.error(e);
        }
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

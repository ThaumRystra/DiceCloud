import { Meteor } from 'meteor/meteor'
import { isEqual, forOwn } from 'lodash';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import propertySchemasIndex from '/imports/api/properties/computedOnlyPropertySchemasIndex.js';

export default function writeAlteredProperties(memo){
  let bulkWriteOperations = [];
  // Loop through all properties on the memo
  forOwn(memo.propsById, changed => {
    let schema = propertySchemasIndex[changed.type];
    if (!schema) return;
    let extraIds = changed.computationDetails.idsOfSameName;
    let ids;
    if (extraIds && extraIds.length){
      ids = [changed._id, ...extraIds];
    } else {
      ids = [changed._id];
    }
    ids.forEach(id => {
      let op = undefined;
      let original = memo.originalPropsById[id];
      let keys = ['dependencies', ...schema.objectKeys()];
      op = addChangedKeysToOp(op, keys, original, changed);
      if (op){
        bulkWriteOperations.push(op);
      }
    });
  });
  bulkWriteProperties(bulkWriteOperations);
}

function addChangedKeysToOp(op, keys, original, changed) {
  // Loop through all keys that can be changed by computation
  // and compile an operation that sets all those keys
  for (let key of keys){
    if (!isEqual(original[key], changed[key])){
      if (!op) op = newOperation(original._id, changed.type);
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
  return op;
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
  // Only use bulk writing if there are many writes to do
  // it makes latency compensation janky, so we avoid it for smaller writes
  if (Meteor.isServer && bulkWriteOps.length > 16){
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
      let updateOneOrMany = op.updateOne || op.updateMany;
      CreatureProperties.update(updateOneOrMany.filter, updateOneOrMany.update, {
        // The bulk code is bypassing validation, so do the same here
        // selector: {type: op.type} // include this if bypass is off
        bypassCollection2: true,
      });
    });
  }
}
import { Meteor } from 'meteor/meteor'
import { isEqual, forOwn } from 'lodash';
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';
// Schemas
// Calculated props
import { ComputedOnlySkillSchema } from '/imports/api/properties/Skills.js';
import { ComputedOnlyAttributeSchema } from '/imports/api/properties/Attributes.js';
import { ComputedOnlyEffectSchema } from '/imports/api/properties/Effects.js';
import { ComputedOnlyToggleSchema } from '/imports/api/properties/Toggles.js';
// End step props
import { ComputedOnlyActionSchema } from '/imports/api/properties/Actions.js';
import { ComputedOnlyAttackSchema } from '/imports/api/properties/Attacks.js';
import { ComputedOnlySavingThrowSchema } from '/imports/api/properties/SavingThrows.js';
import { ComputedOnlySpellListSchema } from '/imports/api/properties/SpellLists.js';
import { ComputedOnlySpellSchema } from '/imports/api/properties/Spells.js';
import { ComputedOnlySlotSchema } from '/imports/api/properties/Slots.js';

const schemasByType = {
  'skill': ComputedOnlySkillSchema,
  'attribute': ComputedOnlyAttributeSchema,
  'effect': ComputedOnlyEffectSchema,
  'toggle': ComputedOnlyToggleSchema,
  'action': ComputedOnlyActionSchema,
  'attack': ComputedOnlyAttackSchema,
  'savingThrow': ComputedOnlySavingThrowSchema,
  'spellList': ComputedOnlySpellListSchema,
  'spell': ComputedOnlySpellSchema,
  'propertySlot': ComputedOnlySlotSchema,
};

export default function writeAlteredProperties(memo){
  let bulkWriteOperations = [];
  // Loop through all properties on the memo
  forOwn(memo.propsById, changed => {
    let schema = schemasByType[changed.type];
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
      op = addChangedKeysToOp(op, schema.objectKeys(), original, changed);
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
      let updateOneOrMany = op.updateOne || op.updateMany;
      CreatureProperties.update(updateOneOrMany.filter, updateOneOrMany.update, {
        // The server code is bypassing collection 2 validation, so do the same
        // on the client
        // include this if bypass is off:
        // selector: {type: op.type}
        bypassCollection2: true,
      });
    });
  }
}

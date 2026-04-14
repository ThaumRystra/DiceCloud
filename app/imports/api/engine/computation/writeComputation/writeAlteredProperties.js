import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import propertySchemasIndex from '/imports/api/properties/computedOnlyPropertySchemasIndex';
import bulkWrite, { addSetOp, addUnsetOp, newOperation } from '/imports/api/engine/shared/bulkWrite';
import updateTabletopPropCount from '/imports/api/tabletop/functions/denormalizeTabletopPropCount'

export default function writeAlteredProperties(computation) {
  const bulkWriteOperations = [];
  // Loop through all properties on the memo
  computation.props.forEach(changed => {
    const schema = propertySchemasIndex[changed.type];
    if (!schema) {
      console.warn('No schema for ' + changed.type);
      return;
    }
    const id = changed._id;
    let op = undefined;
    const original = computation.originalPropsById[id];
    const keys = [
      'inactive',
      'deactivatedBySelf',
      'deactivatedByAncestor',
      'deactivatedByToggle',
      'deactivatingToggleId',
      'damage',
      'dirty',
      'left',
      'right',
      'parentId',
      'triggerIds',
      ...schema.objectKeys(),
    ];
    op = addChangedKeysToOp(op, keys, original, changed);
    if (op) {
      bulkWriteOperations.push(op);
    }
  });
  const writePromise = bulkWrite(bulkWriteOperations, CreatureProperties);
  //if (bulkWriteOperations.length) console.log(`Wrote ${bulkWriteOperations.length} props`);

  // Update the relevant tabletop's property count
  if (computation.creature?.tabletopId) updateTabletopPropCount(computation.creature?.tabletopId);

  return writePromise;
}

function addChangedKeysToOp(op, keys, original, changed) {
  // Loop through all keys that can be changed by computation
  // and compile an operation that sets all those keys
  for (const key of keys) {
    if (!EJSON.equals(original[key], changed[key])) {
      if (!op) op = newOperation(original._id);
      const value = changed[key];
      if (value === undefined) {
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

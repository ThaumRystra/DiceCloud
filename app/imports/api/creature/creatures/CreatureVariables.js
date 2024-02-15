import { getSingleProperty } from '/imports/api/engine/loadCreatures';
import array from '/imports/parser/parseTree/constant';
import constant from '/imports/parser/parseTree/constant';

//set up the collection for creature variables
let CreatureVariables = new Mongo.Collection('creatureVariables');

// Unique index on _creatureId
if (Meteor.isServer) {
  CreatureVariables._ensureIndex({ _creatureId: 1 }, { unique: true })
}

/** No schema because the structure isn't known until compute time
 * Expect documents to look like:
 * {
 *   _id: "nE8Ngd6K4L4jSxLY2",
 *   _creatureId: "nE8Ngd6K4L4jSxLY2", // indexed reference to the creature
 *   explicitlyDefinedVariableName: {...some creatureProperty},
 *   // Must be found in CreatureProperties before using:
 *   linkedProperty: { _propId: "nE8Ngd6K1234SxLY2" } 
 *   implicitVariableName: {value: 10},
 *   undefinedVariableName: {},
 * }
 * Where top level fields that don't start with `_` are variables on the sheet
**/

/**
 * Get the property from the given scope, respecting properties that are just a link to the actual
 * property document
 */
export function getFromScope(name, scope) {
  let value = scope?.[name];
  if (value?._propId) {
    value = getSingleProperty(scope._creatureId, value._propId);
  }
  return value;
}

export function getNumberFromScope(name, scope) {
  const parseNode = getParseNodeFromScope(name, scope);
  if (!parseNode || parseNode.valueType !== 'number') {
    return undefined;
  }
  return parseNode.value;
}

export function getParseNodeFromScope(name, scope) {
  let value = getFromScope(name, scope);
  if (!value) return;
  let valueType = getType(value);
  // Iterate into object.values
  while (valueType === 'object') {
    // Prefer the valueNode over the value
    if (value.valueNode) {
      value = value.valueNode;
    } else {
      value = value.value;
    }
    valueType = getType(value);
  }
  // Return a discovered parse node
  if (valueType === 'parseNode') {
    return value;
  }
  // Return a parse node based on the constant type returned
  if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
    return constant.create({ value });
  }
  // Return a parser array
  if (valueType === 'array') {
    // If the first value is a parse node, assume all the values are
    if (getType(value[0]) === 'parseNode') {
      return array.create({
        values: value,
      });
    }
    // Create the array from js primitives instead
    return array.fromConstantArray(value);
  }
}

function getType(val) {
  if (!val) return typeof val;
  if (Array.isArray(val)) return 'array';
  if (val.parseType) return 'parseNode';
  return typeof val;
}

export default CreatureVariables;

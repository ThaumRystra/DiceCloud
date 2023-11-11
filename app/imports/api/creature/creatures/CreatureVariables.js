import { getSingleProperty } from '/imports/api/engine/loadCreatures';

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

export default CreatureVariables;

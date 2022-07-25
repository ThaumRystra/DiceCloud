//set up the collection for creature variables
let CreatureVariables = new Mongo.Collection('creatureVariables');

// Unique index on _creatureId
if (Meteor.isServer) {
  CreatureVariables._ensureIndex({ _creatureId: 1 }, { unique: true })
}

/** No schema because the structure isn't known until compute time
 * Expect documents to looke like:
 * {
 *   _id: "nE8Ngd6K4L4jSxLY2",
 *   _creatureId: "nE8Ngd6K4L4jSxLY2", // indexed reference to the creature
 *   explicitlyDefinedVariableName: {...some creatureProperty}
 *   implicitVariableName: {value: 10},
 *   undefinedVariableName: {},
 * }
 * Where top level fields that don't start with `_` are variables on the sheet
**/

export default CreatureVariables;

import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import { EJSON } from 'meteor/ejson';

export default function writeScope(creatureId, computation) {
  if (!creatureId) throw 'creatureId is required';
  const scope = computation.scope;
  let variables = computation.variables;
  if (!variables) {
    CreatureVariables.insert({ _creatureId: creatureId });
    variables = {};
  }
  delete variables._id;
  delete variables._creatureId;

  let $set, $unset;

  for (const key in scope) {
    // Mongo can't handle keys that start with a dollar sign
    if (key[0] === '$' || key[0] === '_') continue;

    // Remove large properties that aren't likely to be accessed
    delete scope[key].parent;
    delete scope[key].ancestors;

    // Remove empty keys
    for (const subKey in scope[key]) {
      if (scope[key][subKey] === undefined) {
        delete scope[key][subKey]
      }
    }

    // Only update changed fields
    if (!EJSON.equals(variables[key], scope[key])) {
      if (!$set) $set = {};
      /* Log detailed diffs
      const diff = omitBy(variables[key], (v, k) => EJSON.equals(scope[key][k], v));
      for (let subkey in diff) {
        console.log(`${key}.${subkey}: ${variables[key][subkey]} => ${scope[key][subkey]}`)
      }
      */
      // Set the changed key in the creature variables
      $set[key] = scope[key];
    }
  }

  // Remove all the keys that no longer exist in scope
  for (const key in variables) {
    if (!scope[key]) {
      if (!$unset) $unset = {};
      $unset[key] = 1;
    }
  }

  if ($set || $unset) {
    const update = {};
    if ($set) update.$set = $set;
    if ($unset) update.$unset = $unset;
    CreatureVariables.update({ _creatureId: creatureId }, update);
  }
  if (computation.creature?.dirty) {
    Creatures.update({ _id: creatureId }, { $unset: { dirty: 1 } });
  }
}
/*
function calculateSize(computation) {
  const sizeEstimator = {
    creature: computation.creature,
    variables: computation.variables,
    props: computation.originalPropsById,
  };
  return MongoInternals.NpmModule.BSON.calculateObjectSize(sizeEstimator, { checkKeys: false })
}
*/

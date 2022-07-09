import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import { EJSON } from 'meteor/ejson';

export default function writeScope(creatureId, computation) {
  if (!creatureId) throw 'creatureId is required';
  const scope = computation.scope;
  const variables = computation.variables || {};
  delete variables._id;

  let $set, $unset;

  for (const key in scope){
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
    CreatureVariables.upsert({_creatureId: creatureId}, update);
  }
  if (computation.creature?.dirty) {
    Creatures.update({_creatureId: creatureId}, {$unset: { dirty: 1 }});
  }
}

import Creatures from '/imports/api/creature/creatures/Creatures.js';
import { EJSON } from 'meteor/ejson';
import { omitBy } from 'lodash';

export default function writeScope(creatureId, computation) {
  const scope = computation.scope;
  const variables = computation.creature?.variables || {};
  let $set, $unset;

  if (computation.creature.dirty) {
    $unset = { dirty: 1 };
  }

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
      // Set the changed key in the creature variables
      const diff = omitBy(variables[key], (v, k) => EJSON.equals(scope[key][k], v));
      for (let subkey in diff) {
        console.log(`${key}.${subkey}: ${variables[key][subkey]} => ${scope[key][subkey]}`)
      }
      $set[`variables.${key}`] = scope[key];
    }
  }

  // Remove all the keys that no longer exist in scope
  for (const key in variables) {
    if (!scope[key]) {
      if (!$unset) $unset = {};
      $unset[`variables.${key}`] = 1;
    }
  }

  if ($set || $unset) {
    const updates = Creatures.update(creatureId, { $set, $unset });
    console.log('wrote scope: ', updates);
  }
}

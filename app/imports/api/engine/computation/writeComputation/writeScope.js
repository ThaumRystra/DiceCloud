import Creatures from '/imports/api/creature/creatures/Creatures.js';
import { EJSON } from 'meteor/ejson';

export default function writeScope(creatureId, computation) {
  const scope = computation.scope;
  const variables = computation.creature?.variables || {};
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
      // Set the changed key in the creature variables
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
    Creatures.update(creatureId, {$set, $unset});
  }
}

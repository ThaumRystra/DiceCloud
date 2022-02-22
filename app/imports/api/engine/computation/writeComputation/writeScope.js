import Creatures from '/imports/api/creature/creatures/Creatures.js';

export default function writeScope(creatureId, scope){
  // Remove large properties that aren't likely to be accessed
  for (const key in scope){
    delete scope[key].parent;
    delete scope[key].ancestors;
  }
  Creatures.update(creatureId, {$set: {variables: scope}});
}

import Creatures from '/imports/api/creature/creatures/Creatures.js';

export default function writeScope(creatureId, scope){
  Creatures.update(creatureId, {$set: {variables: scope}});
}

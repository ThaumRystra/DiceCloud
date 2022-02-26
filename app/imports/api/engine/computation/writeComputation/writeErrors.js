import Creatures from '/imports/api/creature/creatures/Creatures.js';

export default function(creatureId, errors = []){
  if (errors.length){
    Creatures.update(creatureId, {$set: {computeErrors: errors}});
  } else {
    Creatures.update(creatureId, {$unset: {computeErrors: 1}});
  }
}

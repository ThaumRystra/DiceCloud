import buildCreatureComputation from './computation/buildCreatureComputation.js';
import computeCreatureComputation from './computation/computeCreatureComputation.js';

export default function computeCreature(creatureId){
  const computation = buildCreatureComputation(creatureId);
  computeCreatureComputation(computation);
  // TODO: writeCreatureComputation(computation);
}

// For now just recompute the whole creature, later only recompute a single
// connected section of the depdendency graph
export function computeCreatureDependencyGroup(property){
  let creatureId = property.ancestors[0].id;
  const computation = buildCreatureComputation(creatureId);
  computeCreatureComputation(computation);
  // TODO: writeCreatureComputation(computation);
}

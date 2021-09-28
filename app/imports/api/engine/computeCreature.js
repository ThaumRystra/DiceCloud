import buildCreatureComputation from './computation/buildCreatureComputation.js';
import computeCreatureComputation from './computation/computeCreatureComputation.js';
import writeAlteredProperties from './computation/writeComputation/writeAlteredProperties.js';

export default function computeCreature(creatureId){
  console.time('Compute creature');
  const computation = buildCreatureComputation(creatureId);
  computeCreatureComputation(computation);
  writeAlteredProperties(computation);
  console.timeEnd('Compute creature');
}

// For now just recompute the whole creature, TODO only recompute a single
// connected section of the depdendency graph
export function computeCreatureDependencyGroup(property){
  let creatureId = property.ancestors[0].id;
  computeCreature(creatureId);
}

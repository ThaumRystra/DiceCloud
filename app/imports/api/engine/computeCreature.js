import buildCreatureComputation from './computation/buildCreatureComputation.js';
import computeCreatureComputation from './computation/computeCreatureComputation.js';
import writeAlteredProperties from './computation/writeComputation/writeAlteredProperties.js';
import writeScope from './computation/writeComputation/writeScope.js';
import writeErrors from './computation/writeComputation/writeErrors.js';

export default function computeCreature(creatureId){
  if (Meteor.isClient) return;
  const computation = buildCreatureComputation(creatureId);
  try {
    computeCreatureComputation(computation);
    writeAlteredProperties(computation);
    writeScope(creatureId, computation.scope);
  } catch (e){
    const errorText = e.reason || e.message || e.toString();
    computation.errors.push({
      type: 'crash',
      details: {error: errorText},
    });
    const logError = {
      creatureId,
      computeError: errorText,
    };
    if (e.stack){
      logError.location = e.stack.split('\n')[1];
    }
    console.error(logError);
  } finally {
    writeErrors(creatureId, computation.errors);
  }
}

// For now just recompute the whole creature, TODO only recompute a single
// connected section of the depdendency graph
export function computeCreatureDependencyGroup(property){
  let creatureId = property.ancestors[0].id;
  computeCreature(creatureId);
}

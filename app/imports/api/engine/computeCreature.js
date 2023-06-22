import buildCreatureComputation from './computation/buildCreatureComputation.js';
import computeCreatureComputation from './computation/computeCreatureComputation.js';
import writeAlteredProperties from './computation/writeComputation/writeAlteredProperties.js';
import writeScope from './computation/writeComputation/writeScope.js';
import writeErrors from './computation/writeComputation/writeErrors.js';

export default function computeCreature(creatureId) {
  if (Meteor.isClient) return;
  // console.log('compute ' + creatureId);
  const computation = buildCreatureComputation(creatureId);
  computeComputation(computation, creatureId);
}

function computeComputation(computation, creatureId) {
  try {
    computeCreatureComputation(computation);
    writeAlteredProperties(computation);
    writeScope(creatureId, computation);
  } catch (e) {
    const errorText = e.reason || e.message || e.toString();
    computation.errors.push({
      type: 'crash',
      details: { error: errorText },
    });
    const logError = {
      creatureId,
      computeError: errorText,
    };
    if (e.stack) {
      logError.location = e.stack.split('\n')[1];
    }
    console.error(logError);
    throw e;
  } finally {
    checkPropertyCount(computation)
    writeErrors(creatureId, computation.errors);
  }
}

const MAX_PROPS = 1000;
function checkPropertyCount(computation) {
  const count = computation.props.length;
  if (count <= MAX_PROPS) return;
  computation.errors.push({
    type: 'warning',
    details: {
      error: `This character sheet has too many properties and may perform poorly ( ${count} / ${MAX_PROPS} )`
    },
  });
}

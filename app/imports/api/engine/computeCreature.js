import buildCreatureComputation from './computation/buildCreatureComputation';
import computeCreatureComputation from './computation/computeCreatureComputation';
import writeAlteredProperties from './computation/writeComputation/writeAlteredProperties';
import writeScope from './computation/writeComputation/writeScope';
import writeErrors from './computation/writeComputation/writeErrors';

export default async function computeCreature(creatureId) {
  if (Meteor.isClient) return;
  // console.log('compute ' + creatureId);
  const computation = buildCreatureComputation(creatureId);
  await computeComputation(computation, creatureId);
}

async function computeComputation(computation, creatureId) {
  try {
    await computeCreatureComputation(computation);
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

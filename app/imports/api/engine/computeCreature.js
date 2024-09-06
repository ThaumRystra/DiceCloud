import buildCreatureComputation from './computation/buildCreatureComputation';
import computeCreatureComputation from './computation/computeCreatureComputation';
import writeAlteredProperties from './computation/writeComputation/writeAlteredProperties';
import writeScope from './computation/writeComputation/writeScope';
import writeErrorsAndPropCount from './computation/writeComputation/writeErrorsAndPropCount';

export default async function computeCreature(creatureId) {
  if (Meteor.isClient) return;
  // console.log('compute ' + creatureId);
  const computation = buildCreatureComputation(creatureId);
  await computeComputation(computation, creatureId);
}

async function computeComputation(computation, creatureId) {
  try {
    await computeCreatureComputation(computation);
    const writePromise = writeAlteredProperties(computation);
    const scopeWritePromise = writeScope(creatureId, computation);
    await Promise.all([writePromise, scopeWritePromise]);
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
  } finally {
    checkPropertyCount(computation)
    writeErrorsAndPropCount(creatureId, computation.errors, computation.props.length);
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

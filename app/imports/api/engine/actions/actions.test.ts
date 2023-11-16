import { assert } from 'chai';
import '/imports/api/simpleSchemaConfig.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { propsFromForest } from '/imports/api/properties/tests/propTestBuilder.testFn';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables';
import Actions, { createAction } from '/imports/api/engine/actions/Actions';

describe('Interrupt action system', async function () {
  CreatureProperties.remove({});
  Creatures.remove({});
  CreatureVariables.remove({});
  const creatureId = await Creatures.insertAsync({
    name: 'action test creature',
    owner: Random.id(),
  });
  await insertActionTestProps();

  it('creates an action', async function () {
    const note1 = await CreatureProperties.findOneAsync(note1Id);
    const actionId = await createAction(note1);
    const action = await Actions.findOneAsync(actionId);
    console.log(action);
  });
});

const creatureId = Random.id();
const note1Id = Random.id();

const propForest = [
  {
    _id: note1Id,
    type: 'note',
    summary: {
      text: 'Note 1 summary. 1 + 1 = {1 + 1}'
    },
  }
];

function insertActionTestProps() {
  const promises = propsFromForest(propForest, [{ id: creatureId, collection: 'creatures' }]).map(prop => {
    return CreatureProperties.insertAsync(prop);
  });
  return Promise.all(promises);
}

import { assert } from 'chai';
import {
  allLogContent,
  createTestCreature,
  getRandomIds,
  removeAllCreaturesAndProps,
  runActionById
} from '/imports/api/engine/action/functions/actionEngineTest.testFn';

const [
  creatureId, rollId,
] = getRandomIds(2);

const actionTestCreature = {
  _id: creatureId,
  props: [
    {
      _id: rollId,
      type: 'roll',
      name: 'Roll Name',
      variableName: 'roll1',
      roll: { calculation: '7 + 15' },
      children: [
        {
          type: 'note',
          summary: { text: 'roll: {roll1}' },
        },
      ],
    },
  ],
};

describe('Apply roll properties', function () {
  // Increase timeout
  this.timeout(8000);

  before(async function () {
    await removeAllCreaturesAndProps();
    await createTestCreature(actionTestCreature);
  });

  it('Saves the value of the roll into the variable name', async function () {
    const action = await runActionById(rollId);
    assert.exists(action);
    assert.deepEqual(allLogContent(action), [{
      inline: true,
      name: 'Roll Name',
      value: '**22**',
    }, {
      value: 'roll: 22',
    }]);
  });
});

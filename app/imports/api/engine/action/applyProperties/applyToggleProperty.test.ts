import { assert } from 'chai';
import {
  allMutations,
  createTestCreature,
  getRandomIds,
  removeAllCreaturesAndProps,
  runActionById
} from '/imports/api/engine/action/functions/actionEngineTest.testFn';

const [
  creatureId, trueToggleId, falseToggleId,
] = getRandomIds(3);

const actionTestCreature = {
  _id: creatureId,
  props: [
    {
      _id: trueToggleId,
      type: 'toggle',
      condition: { calculation: 'true' },
      children: [
        {
          type: 'note',
          summary: { text: 'this should run' },
        },
      ],
    },
    {
      _id: falseToggleId,
      type: 'toggle',
      condition: { calculation: 'false' },
      children: [
        {
          type: 'note',
          summary: { text: 'this should not run' },
        },
      ],
    },
  ],
}

describe('Apply Toggle Properties', function () {
  // Increase timeout
  this.timeout(8000);

  before(async function () {
    await removeAllCreaturesAndProps();
    await createTestCreature(actionTestCreature);
  });

  // If branch
  it('Runs a toggle with a true condition', async function () {
    const action = await runActionById(trueToggleId);
    assert.deepEqual(allMutations(action), [{
      contents: [{ value: 'this should run' }],
      targetIds: [],
    }]);
  });
  it('runs a toggle with a false condition', async function () {
    const action = await runActionById(falseToggleId);
    assert.deepEqual(allMutations(action), []);
  });
});

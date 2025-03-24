import { assert } from 'chai';
import {
  allLogContent,
  createTestCreature,
  getRandomIds,
  removeAllCreaturesAndProps,
  runActionById
} from '/imports/api/engine/action/functions/actionEngineTest.testFn';

const [
  creatureId, dropLowestId
] = getRandomIds(2);

const actionTestCreature = {
  _id: creatureId,
  props: [
    {
      _id: dropLowestId,
      type: 'note',
      summary: { text: 'Note summary {dropLowest(10d6,3)}' },
      children: [
        {
          type: 'roll',
          name: 'Roll',
          variableName: 'dropLowestVar',
          roll: { calculation: 'dropLowest(10d6,3)' }
        }
      ]
    },
  ],
}

describe('Built in dice functions', function () {
  // Increase timeout
  this.timeout(8000);

  before(async function () {
    await removeAllCreaturesAndProps();
    await createTestCreature(actionTestCreature);
  });

  it('Rolls 10d6 and drops the lowest 3 values', async function () {
    const action = await runActionById(dropLowestId);
    assert.exists(action);
    assert.deepEqual(allLogContent(action), [{
      value: 'Note summary 33',
    }, {
      inline: true,
      name: 'Roll',
      value: '10d6 [~~3~~, 4, 5, 6, ~~1~~, ~~2~~, 3, 4, 5, 6]\n**33**',
    }]);
  });
});

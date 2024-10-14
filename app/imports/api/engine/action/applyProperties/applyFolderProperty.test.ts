import { assert } from 'chai';
import {
  allMutations,
  createTestCreature,
  getRandomIds,
  removeAllCreaturesAndProps,
  runActionById
} from '/imports/api/engine/action/functions/actionEngineTest.testFn';

const [
  creatureId, folderId
] = getRandomIds(100);

const actionTestCreature = {
  _id: creatureId,
  props: [
    {
      _id: folderId,
      type: 'folder',
      children: [{
        type: 'note',
        summary: { text: 'this should run' },
      }],
    },
  ],
}

describe('Apply folder properties', function () {
  // Increase timeout
  this.timeout(8000);

  before(async function () {
    await removeAllCreaturesAndProps();
    await createTestCreature(actionTestCreature);
  });

  it('Applies the children of the folder', async function () {
    const action = await runActionById(folderId);
    assert.exists(action);
    assert.deepEqual(allMutations(action), [{
      contents: [
        {
          value: 'this should run'
        }
      ],
      targetIds: [],
    }]);
  });
});

import { assert } from 'chai';
import {
  allMutations,
  createTestCreature,
  getRandomIds,
  removeAllCreaturesAndProps,
  runActionById
} from '/imports/api/engine/action/functions/actionEngineTest.testFn';

const [
  creatureId, noteId
] = getRandomIds(2);

const actionTestCreature = {
  _id: creatureId,
  props: [
    {
      _id: noteId,
      type: 'note',
      name: 'Note Name',
      summary: { text: 'Note summary {1 + 2}' }
    },
  ],
}

describe('Apply note properties', function () {
  // Increase timeout
  this.timeout(8000);

  before(async function () {
    await removeAllCreaturesAndProps();
    await createTestCreature(actionTestCreature);
  });

  it('Applies the note text', async function () {
    const action = await runActionById(noteId);
    assert.exists(action);
    assert.deepEqual(allMutations(action), [{
      contents: [
        {
          name: 'Note Name',
          value: 'Note summary 3'
        }
      ],
      targetIds: [],
    }]);
  });
});

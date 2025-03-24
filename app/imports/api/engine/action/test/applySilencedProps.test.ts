import { assert } from 'chai';
import {
  allMutations,
  createTestCreature,
  getRandomIds,
  removeAllCreaturesAndProps,
  runActionById,
  TestCreature
} from '/imports/api/engine/action/functions/actionEngineTest.testFn';

const [
  creatureId, silencedNoteId
] = getRandomIds(2);

const actionTestCreature: TestCreature = {
  _id: creatureId,
  props: [
    {
      _id: silencedNoteId,
      type: 'note',
      name: 'Note Name',
      summary: { text: 'Note summary {1 + 2}' },
      silent: true,
    },
  ],
}

describe('Apply silenced properties', function () {
  // Increase timeout
  this.timeout(8000);

  before(async function () {
    await removeAllCreaturesAndProps();
    await createTestCreature(actionTestCreature);
  });

  it('Hides the note text', async function () {
    const action = await runActionById(silencedNoteId);
    assert.exists(action);
    assert.deepEqual(allMutations(action), [{
      contents: [
        {
          name: 'Note Name',
          value: 'Note summary 3',
          silenced: true,
        },
      ],
      targetIds: [],
    }]);
  });
});

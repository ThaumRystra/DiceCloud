import { assert } from 'chai';
import {
  allMutations,
  createTestCreature,
  getRandomIds,
  removeAllCreaturesAndProps,
  runActionById
} from '/imports/api/engine/action/functions/actionEngineTest.testFn';

const [
  creatureId, savingThrowId, targetCreatureId, targetCreature2Id
] = getRandomIds(4);

const actionTestCreature = {
  _id: creatureId,
  props: [
    {
      _id: savingThrowId,
      type: 'savingThrow',
      name: 'Strength Save',
      dc: { calculation: '10 + 3' },
      stat: 'strengthSave',
      children: [{
        type: 'branch',
        branchType: 'successfulSave',
        children: [{
          type: 'note',
          summary: { text: 'note to apply on save' },
        }],
      }, {
        type: 'branch',
        branchType: 'failedSave',
        children: [{
          type: 'note',
          summary: { text: 'note to apply on failed save' },
        }],
      }],
    },
  ],
}

const actionTargetCreature = {
  _id: targetCreatureId,
  props: [
    {
      type: 'skill',
      variableName: 'strengthSave',
      baseValue: { calculation: '3' },
    },
  ],
}
const actionTargetCreature2 = {
  _id: targetCreature2Id,
  props: [
    {
      type: 'skill',
      variableName: 'strengthSave',
      baseValue: { calculation: '2' },
    },
  ],
}

describe('Apply saving throw properties', function () {
  // Increase timeout
  this.timeout(8000);

  before(async function () {
    await removeAllCreaturesAndProps();
    await createTestCreature(actionTestCreature);
    await createTestCreature(actionTargetCreature);
    await createTestCreature(actionTargetCreature2);
  });

  it('Makes multiple creatures make saves', async function () {
    const action = await runActionById(savingThrowId, [targetCreatureId, targetCreature2Id]);
    assert.exists(action);
    assert.deepEqual(allMutations(action), [
      {
        'contents': [{
          'inline': true,
          'name': 'Strength Save',
          'value': 'DC **13**',
        }, {
          'inline': true,
          'name': 'Successful save',
          'value': '1d20 [ 10 ] + 3\n**13**',
        }],
        'targetIds': [targetCreatureId],
      }, {
        'contents': [{
          'value': 'note to apply on save',
        }],
        'targetIds': [targetCreatureId],
      }, {
        'contents': [{
          'inline': true,
          'name': 'Strength Save',
          'value': 'DC **13**',
        }, {
          'inline': true,
          'name': 'Failed save',
          'value': '1d20 [ 10 ] + 2\n**12**',
        }],
        'targetIds': [targetCreature2Id],
      }, {
        'contents': [{
          'value': 'note to apply on failed save',
        }],
        'targetIds': [targetCreature2Id],
      },
    ],
    );
  });
});

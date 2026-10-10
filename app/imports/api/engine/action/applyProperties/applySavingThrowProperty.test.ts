import { assert } from 'chai';
import {
  allMutations,
  createTestCreature,
  getRandomIds,
  removeAllCreaturesAndProps,
  runActionById,
  TestCreature
} from '/imports/api/engine/action/functions/actionEngineTest.testFn';
import inputProviderForTests from '/imports/api/engine/action/functions/userInput/inputProviderForTests.testFn';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';

const [
  creatureId, savingThrowId, targetCreatureId, targetCreature2Id, targetCreature3Id
] = getRandomIds(5);

const actionTestCreature: TestCreature = {
  _id: creatureId,
  props: [
    {
      _id: savingThrowId,
      type: 'savingThrow',
      name: 'Strength Save',
      dc: { calculation: '11 + 3' },
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

const actionTargetCreature: TestCreature = {
  _id: targetCreatureId,
  props: [
    {
      type: 'skill',
      variableName: 'strengthSave',
      baseValue: { calculation: '3' },
    },
  ],
}
const actionTargetCreature2: TestCreature = {
  _id: targetCreature2Id,
  props: [
    {
      type: 'skill',
      variableName: 'strengthSave',
      baseValue: { calculation: '2' },
    },
  ],
}

// Has advantage +2 on strength saves
const actionTargetCreature3: TestCreature = {
  _id: targetCreature3Id,
  props: [
    {
      type: 'skill',
      variableName: 'strengthSave',
      baseValue: { calculation: '1' },
    },
    {
      type: 'effect',
      operation: 'advantage',
      amount: { calculation: '2' },
      stats: ['strengthSave'],
    },
  ],
}

// Records suggested advantage and answers with a fixed choice, or the suggestion
function advantageProvider(suggestions: number[], choice?: number): InputProvider {
  return {
    ...inputProviderForTests,
    async advantage(suggestedAdvantage) {
      suggestions.push(suggestedAdvantage);
      return choice ?? suggestedAdvantage;
    },
  };
}

describe('Apply saving throw properties', function () {
  // Increase timeout
  this.timeout(8000);

  before(async function () {
    await removeAllCreaturesAndProps();
    await createTestCreature(actionTestCreature);
    await createTestCreature(actionTargetCreature);
    await createTestCreature(actionTargetCreature2);
    await createTestCreature(actionTargetCreature3);
  });

  it('Makes multiple creatures make saves', async function () {
    const action = await runActionById(savingThrowId, [targetCreatureId, targetCreature2Id]);
    assert.exists(action);
    assert.deepEqual(allMutations(action), [
      {
        'contents': [{
          'inline': true,
          'name': 'Strength Save',
          'value': 'DC **14**',
        }, {
          'inline': true,
          'name': 'Successful save',
          'value': '2d10 [ 5, 6 ] + 3\n**14**',
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
          'value': 'DC **14**',
        }, {
          'inline': true,
          'name': 'Failed save',
          'value': '2d10 [ 5, 6 ] + 2\n**13**',
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

  it('Suggests the computed advantage of the save and rolls with it', async function () {
    const suggestions: number[] = [];
    const action = await runActionById(savingThrowId, [targetCreature3Id], advantageProvider(suggestions));
    assert.deepEqual(suggestions, [2]);
    assert.deepEqual(allMutations(action)[0].contents?.[1], {
      inline: true,
      name: 'Successful save',
      value: 'Advantage +2\n2d10 [ ~~5~~, ~~6~~, 7, 8 ] + 1\n**16**',
    });
  });

  it('Rolls saves with the advantage chosen by the user', async function () {
    const suggestions: number[] = [];
    const action = await runActionById(savingThrowId, [targetCreature2Id], advantageProvider(suggestions, 1));
    assert.deepEqual(suggestions, [0], 'Save without effects should suggest a normal roll');
    assert.deepEqual(allMutations(action)[0].contents?.[1], {
      inline: true,
      name: 'Successful save',
      value: 'Advantage +1\n2d10 [ ~~5~~, 6, 7 ] + 2\n**15**',
    });
  });
});

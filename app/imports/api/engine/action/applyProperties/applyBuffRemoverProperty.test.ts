import { assert } from 'chai';
import {
  allMutations,
  createTestCreature,
  getRandomIds,
  removeAllCreaturesAndProps,
  runActionById
} from '/imports/api/engine/action/functions/actionEngineTest.testFn';

const [
  creatureId, otherCreatureId, buffId, removeParentBuffId, removeTargetBuffsId,
] = getRandomIds(100);

const actionTestCreature = {
  _id: creatureId,
  props: [
    {
      _id: buffId,
      type: 'buff',
      description: { text: 'This buff reduces AC of target by difference between the strength of caster {strength} and the target {~target.strength}' },
      tags: ['some buff'],
      children: [
        {
          type: 'effect',
          stats: ['armor'],
          operation: 'add',
          amount: { calculation: '~target.strength - strength' },
        },
        {
          _id: removeParentBuffId,
          type: 'buffRemover',
          targetParentBuff: true,
          target: 'self',
        },
      ],
    },
    {
      type: 'attribute',
      attributeType: 'stat',
      variableName: 'strength',
      baseValue: { calculation: '18' },
    },
  ],
};

const actionOtherCreature = {
  _id: otherCreatureId,
  props: [
    {
      _id: removeTargetBuffsId,
      type: 'buffRemover',
      target: 'target',
      targetTags: ['some buff']
    },
  ],
};

describe('Apply Buff Remover Properties', function () {
  // Increase timeout
  this.timeout(8000);

  beforeEach(async function () {
    await removeAllCreaturesAndProps();
    await createTestCreature(actionTestCreature);
    await createTestCreature(actionOtherCreature);
  });

  it('removes a parent buff', async function () {
    const action = await runActionById(removeParentBuffId);
    const mutations = allMutations(action);
    assert.deepEqual(mutations, [{
      contents: [{
        name: 'Removed',
        value: 'Buff',
      }],
      removals: [{
        propId: buffId,
      }],
      targetIds: []
    }]);
  });

  it('removes a tag targeted buff', async function () {
    const action = await runActionById(removeTargetBuffsId, [creatureId]);
    const mutations = allMutations(action);
    assert.deepEqual(mutations, [{
      contents: [{
        name: 'Removed',
        value: 'Buff',
      }],
      removals: [{
        propId: buffId,
      }],
      targetIds: [creatureId]
    }]);
  });
});

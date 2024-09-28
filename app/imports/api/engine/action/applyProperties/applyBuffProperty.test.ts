import { assert } from 'chai';
import {
  allMutations,
  createTestCreature,
  getRandomIds,
  removeAllCreaturesAndProps,
  runActionById
} from '/imports/api/engine/action/functions/actionEngineTest.testFn';

const [
  creatureId, targetCreatureId, buffId
] = getRandomIds(100);

const actionTestCreature = {
  _id: creatureId,
  props: [
    {
      _id: buffId,
      type: 'buff',
      description: { text: 'This buff reduces AC of target by difference between the strength of caster {strength} and the target {~target.strength}' },
      children: [
        {
          type: 'effect',
          stats: ['armor'],
          operation: 'add',
          amount: { calculation: '~target.strength - strength' },
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

const actionTargetCreature = {
  _id: targetCreatureId,
  props: [
    {
      type: 'attribute',
      attributeType: 'stat',
      variableName: 'armor',
      baseValue: { calculation: '10' },
    },
    {
      type: 'attribute',
      attributeType: 'ability',
      variableName: 'strength',
      baseValue: { calculation: '12' },
    },
  ],
};

describe('Apply Buff Properties', function () {
  // Increase timeout
  this.timeout(8000);

  before(async function () {
    await removeAllCreaturesAndProps();
    await createTestCreature(actionTestCreature);
    await createTestCreature(actionTargetCreature);
  });

  it('Applies a buff and freezes some variables', async function () {
    const action = await runActionById(buffId, [targetCreatureId]);
    const mutations = allMutations(action);
    // Get random Ids of inserted props
    const insertedBuffId = mutations?.[1]?.inserts?.[0]?._id;
    const insertedEffectId = mutations?.[1]?.inserts?.[1]?._id;
    assert.deepEqual(mutations, [{
      contents: [{
        name: 'Buff',
        // TODO Make target strength available in action scope to fix: 'target 0' -> 'target 12'
        value: 'This buff reduces AC of target by difference between the strength of caster 18 and the target 0',
      }],
      targetIds: [targetCreatureId],
    }, {
      contents: [],
      inserts: [{
        _id: insertedBuffId,
        type: 'buff',
        description: {
          text: 'This buff reduces AC of target by difference between the strength of caster {18} and the target {strength}'
        },
        left: 1,
        right: 4,
        parentId: null,
        root: {
          collection: 'creatures',
          id: targetCreatureId,
        },
        tags: [],
        target: 'target',
      }, {
        _id: insertedEffectId,
        type: 'effect',
        stats: ['armor'],
        operation: 'add',
        amount: { calculation: 'strength - 18' },
        left: 2,
        right: 3,
        parentId: insertedBuffId,
        root: {
          collection: 'creatures',
          id: targetCreatureId,
        },
        tags: [],
      }],
      targetIds: [targetCreatureId],
    }]);
  });
});

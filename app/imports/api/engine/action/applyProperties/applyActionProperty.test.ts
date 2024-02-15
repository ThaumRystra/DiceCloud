import { assert } from 'chai';
import {
  allMutations,
  createTestCreature,
  randomIds,
  removeAllCreaturesAndProps,
  runActionById
} from '/imports/api/engine/action/functions/actionEngineTest.testFn';

const [
  creatureId, targetCreatureId, targetCreature2Id,
  emptyActionId, attackActionId, usesActionId, attackMissId,
] = randomIds;

const actionTestCreature = {
  _id: creatureId,
  props: [
    // Empty
    {
      _id: emptyActionId,
      type: 'action',
    },
    // Attack that hits
    {
      _id: attackActionId,
      type: 'action',
      attackRoll: { calculation: '10' },
    },
    // Attack that misses
    {
      _id: attackMissId,
      type: 'action',
      attackRoll: { calculation: '-20' },
    },
    // Disable crits
    {
      type: 'attribute',
      attributeType: 'stat',
      variableName: '~criticalHitTarget',
      baseValue: { calculation: '21' },
    },
    {
      type: 'attribute',
      attributeType: 'stat',
      variableName: '~criticalMissTarget',
      baseValue: { calculation: '0' },
    },
    // Has uses
    {
      _id: usesActionId,
      type: 'action',
      uses: { calculation: '3' },
      usesUsed: 1,
      reset: 'longRest',
    },
  ],
}

const actionTargetCreature = {
  _id: targetCreatureId,
  props: [
    {
      type: 'attribute',
      attributeType: 'stat',
      variableName: 'armor',
      baseValue: { calculation: '10' },
    }
  ]
}

const actionTargetCreature2 = {
  _id: targetCreature2Id,
  props: [
    {
      type: 'attribute',
      attributeType: 'stat',
      variableName: 'armor',
      baseValue: { calculation: '10' },
    }
  ]
}

describe('Apply Action Properties', function () {
  // Increase timeout
  this.timeout(8000);

  before(async function () {
    await removeAllCreaturesAndProps();
    await createTestCreature(actionTestCreature);
    await createTestCreature(actionTargetCreature);
    await createTestCreature(actionTargetCreature2);
  });

  it('should run empty actions', async function () {
    const action = await runActionById(emptyActionId);
    assert.exists(action);
    assert.deepEqual(allMutations(action), [{
      contents: [{ name: 'Action' }],
      targetIds: [],
    }]);
  });

  it('should make attack rolls against multiple creatures', async function () {
    const action = await runActionById(attackActionId, [
      targetCreatureId,
      targetCreature2Id,
    ]);
    assert.deepEqual(allMutations(action), [{
      contents: [{
        name: 'Action'
      }],
      targetIds: [
        targetCreatureId,
        targetCreature2Id,
      ]
    }, {
      contents: [{
        inline: true,
        name: 'Hit!',
        value: '1d20 [10] + 10\n**20**',
      }],
      targetIds: [targetCreatureId],
    }, {
      contents: [{
        inline: true,
        name: 'Hit!',
        value: '1d20 [10] + 10\n**20**',
      }],
      targetIds: [targetCreature2Id],
    }]);
  });

  it('should make attack rolls that miss', async function () {
    const action = await runActionById(attackMissId, [targetCreatureId]);
    assert.deepEqual(allMutations(action), [{
      contents: [{
        name: 'Action'
      }],
      targetIds: [
        targetCreatureId,
      ]
    }, {
      contents: [{
        inline: true,
        name: 'Miss!',
        value: '1d20 [10] + 10\n**20**',
      }],
      targetIds: [targetCreatureId],
    }]);
  });

});

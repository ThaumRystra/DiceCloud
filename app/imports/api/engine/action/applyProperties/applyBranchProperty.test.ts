import { assert } from 'chai';
import {
  allMutations,
  createTestCreature,
  getRandomIds,
  removeAllCreaturesAndProps,
  runActionById
} from '/imports/api/engine/action/functions/actionEngineTest.testFn';

const [
  creatureId, targetCreatureId, ifTrueBranchId, ifFalseBranchId, indexBranchId, attackHitId, attackMissId, saveSucceedId, saveFailId, randomBranchId, targetCreature2Id, eachTargetBranchId, choiceBranchId,
] = getRandomIds(100);

const actionTestCreature = {
  _id: creatureId,
  props: [
    // If branch 
    {
      _id: ifTrueBranchId,
      type: 'branch',
      branchType: 'if',
      condition: { calculation: 'true' },
      children: [
        {
          type: 'note',
          summary: { text: 'this should run' },
        },
      ],
    },
    {
      _id: ifFalseBranchId,
      type: 'branch',
      branchType: 'if',
      condition: { calculation: 'false' },
      children: [
        {
          type: 'note',
          summary: { text: 'this should not run' },
        },
      ],
    },
    // index branch
    {
      _id: indexBranchId,
      type: 'branch',
      branchType: 'index',
      condition: { calculation: '1 + 1' },
      children: [
        {
          type: 'note',
          summary: { text: 'FAIL: index child 1 should not run' },
        },
        {
          type: 'note',
          summary: { text: 'Child 2 should run' },
        },
        {
          type: 'note',
          summary: { text: 'FAIL: index child 3 should not run' },
        },
      ],
    },
    // Hit and miss branches
    {
      _id: attackHitId,
      type: 'action',
      attackRoll: { calculation: '1' },
      children: [
        {
          type: 'branch',
          branchType: 'hit',
          children: [{
            type: 'note',
            summary: { text: 'attack hit branch' }
          }],
        },
        {
          type: 'branch',
          branchType: 'miss',
          children: [{
            type: 'note',
            summary: { text: 'attack miss branch' }
          }],
        },
      ]
    },
    {
      _id: attackMissId,
      type: 'action',
      attackRoll: { calculation: '-1' },
      children: [
        {
          type: 'branch',
          branchType: 'hit',
          children: [{
            type: 'note',
            summary: { text: 'attack hit branch' }
          }],
        },
        {
          type: 'branch',
          branchType: 'miss',
          children: [{
            type: 'note',
            summary: { text: 'attack miss branch' }
          }],
        },
      ]
    },

    // Save and fail save branch
    {
      _id: saveSucceedId,
      type: 'savingThrow',
      dc: { calculation: '10' },
      target: 'target',
      stat: 'strengthSave',
      children: [
        {
          type: 'branch',
          branchType: 'successfulSave',
          children: [{
            type: 'note',
            summary: { text: 'made save branch' }
          }],
        },
        {
          type: 'branch',
          branchType: 'failedSave',
          children: [{
            type: 'note',
            summary: { text: 'failed save branch' }
          }],
        },
      ]
    },
    {
      _id: saveFailId,
      type: 'savingThrow',
      dc: { calculation: '15' },
      target: 'target',
      stat: 'strengthSave',
      children: [
        {
          type: 'branch',
          branchType: 'successfulSave',
          children: [{
            type: 'note',
            summary: { text: 'made save branch' }
          }],
        },
        {
          type: 'branch',
          branchType: 'failedSave',
          children: [{
            type: 'note',
            summary: { text: 'failed save branch' }
          }],
        },
      ]
    },

    // Random branch
    {
      _id: randomBranchId,
      type: 'branch',
      branchType: 'random',
      children: [
        {
          type: 'note',
          summary: { text: 'FAIL: random child 1 should not run' },
        },
        {
          type: 'note',
          summary: { text: 'Random child 2 should run' },
        },
        {
          type: 'note',
          summary: { text: 'FAIL: random child 3 should not run' },
        },
      ],
    },

    // Each target branch
    {
      _id: eachTargetBranchId,
      type: 'branch',
      branchType: 'eachTarget',
      children: [
        {
          type: 'note',
          summary: { text: 'some note' }
        }
      ]
    },

    // Choice branch
    {
      _id: choiceBranchId,
      type: 'branch',
      branchType: 'choice',
      children: [
        {
          type: 'note',
          summary: { text: 'Choice child 1 should run' },
        },
        {
          type: 'note',
          summary: { text: 'Fail: choice child 2 should not run' },
        },
        {
          type: 'note',
          summary: { text: 'Fail: choice child 3 should not run' },
        },
      ],
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
    },
    {
      type: 'skill',
      skillType: 'save',
      variableName: 'strengthSave',
      baseValue: { calculation: '3' },
    },
  ]
}

const actionTargetCreature2 = {
  _id: targetCreature2Id,
  props: [
    {
      type: 'attribute',
      attributeType: 'stat',
      variableName: 'armor',
      baseValue: { calculation: '15' },
    },
  ]
}

describe('Apply Branch Properties', function () {
  // Increase timeout
  this.timeout(8000);

  before(async function () {
    await removeAllCreaturesAndProps();
    await createTestCreature(actionTestCreature);
    await createTestCreature(actionTargetCreature);
    await createTestCreature(actionTargetCreature2);
  });

  // If branch
  it('Runs an if branch with a true condition', async function () {
    const action = await runActionById(ifTrueBranchId);
    assert.deepEqual(allMutations(action), [{
      contents: [{ value: 'this should run' }],
      targetIds: [],
    }]);
  });
  it('runs an if branch with a false condition', async function () {
    const action = await runActionById(ifFalseBranchId);
    assert.deepEqual(allMutations(action), []);
  });
  it('runs an if branch and chooses the correct child', async function () {
    const action = await runActionById(indexBranchId);
    assert.deepEqual(allMutations(action), [{
      contents: [{ value: 'Child 2 should run' }],
      targetIds: [],
    }]);
  });

  // Hit and miss branch
  it('Runs only hit branches on an attack that hits', async function () {
    const action = await runActionById(attackHitId, [targetCreatureId]);
    assert.deepEqual(allMutations(action), [{
      contents: [{ name: 'Action' }],
      targetIds: [targetCreatureId],
    }, {
      contents: [{ inline: true, name: 'Hit!', value: '1d20 [10] + 1\n**11**' }],
      targetIds: [targetCreatureId],
    }, {
      contents: [{ value: 'attack hit branch' }],
      targetIds: [targetCreatureId],
    }]);
  });
  it('Runs only miss branches on an attack that misses', async function () {
    const action = await runActionById(attackMissId, [targetCreatureId]);
    assert.deepEqual(allMutations(action), [{
      contents: [{ name: 'Action' }],
      targetIds: [targetCreatureId],
    }, {
      contents: [{ inline: true, name: 'Miss!', value: '1d20 [10] − 1\n**9**' }],
      targetIds: [targetCreatureId],
    }, {
      contents: [{ value: 'attack miss branch' }],
      targetIds: [targetCreatureId],
    }]);
  });

  // Save succeed and fail branches
  it('Runs only miss branches on an attack that misses', async function () {
    const action = await runActionById(saveSucceedId, [targetCreatureId]);
    assert.deepEqual(allMutations(action), [{
      contents: [{
        name: 'Saving throw',
        value: 'DC **10**',
        inline: true
      }, {
        name: 'Successful save',
        value: '1d20 [ 10 ] + 3\n**13**',
        inline: true
      }],
      targetIds: [targetCreatureId],
    }, {
      contents: [{ value: 'made save branch' }],
      targetIds: [targetCreatureId],
    }]);
  });
  it('Runs only miss branches on an attack that misses', async function () {
    const action = await runActionById(saveFailId, [targetCreatureId]);
    assert.deepEqual(allMutations(action), [{
      contents: [{
        name: 'Saving throw',
        value: 'DC **15**',
        inline: true
      }, {
        name: 'Failed save',
        value: '1d20 [ 10 ] + 3\n**13**',
        inline: true
      }],
      targetIds: [targetCreatureId],
    }, {
      contents: [{ value: 'failed save branch' }],
      targetIds: [targetCreatureId],
    }]);
  });

  // Random branches, RNG is fixed at average for testing, so child 2 should run
  it('runs a random branch and chooses the correct child', async function () {
    const action = await runActionById(randomBranchId);
    assert.deepEqual(allMutations(action), [{
      contents: [{ value: 'Random child 2 should run' }],
      targetIds: [],
    }]);
  });

  // Branches can split actions across targets
  it('Can split actions to targets using a branch', async function () {
    const action = await runActionById(eachTargetBranchId, [targetCreatureId, targetCreature2Id]);
    assert.deepEqual(allMutations(action), [{
      contents: [{ value: 'some note' }],
      targetIds: [targetCreatureId],
    }, {
      contents: [{ value: 'some note' }],
      targetIds: [targetCreature2Id],
    }]);
  });

  // Choice branches, choices are fixed to first option for testing
  it('runs a choice branch and chooses the correct child', async function () {
    const action = await runActionById(choiceBranchId);
    assert.deepEqual(allMutations(action), [{
      contents: [{ value: 'Choice child 1 should run' }],
      targetIds: [],
    }]);
  });
});

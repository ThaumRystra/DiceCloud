import { assert } from 'chai';
import {
  allMutations,
  createTestCreature,
  getRandomIds,
  removeAllCreaturesAndProps,
  runActionById
} from '/imports/api/engine/action/functions/actionEngineTest.testFn';

const [
  creatureId, targetCreatureId, targetCreature2Id, damageTargetId, damageSelfId, targetCreatureHitPointsId, targetCreature2HitPointsId, selfHitPointsId
] = getRandomIds(100);

const actionTestCreature = {
  _id: creatureId,
  props: [
    {
      _id: damageTargetId,
      type: 'damage',
      target: 'target',
      amount: { calculation: '2d6 + 7' }
    },
    {
      _id: damageSelfId,
      type: 'damage',
      target: 'self',
      amount: { calculation: '1d12 + 7' }
    },
    {
      _id: selfHitPointsId,
      type: 'attribute',
      name: 'Hit Points',
      attributeType: 'healthBar',
      variableName: 'hitPoints',
      baseValue: { calculation: '20' },
    },
  ],
}

const actionTargetCreature = {
  _id: targetCreatureId,
  props: [
    {
      _id: targetCreatureHitPointsId,
      type: 'attribute',
      name: 'Hit Points',
      attributeType: 'healthBar',
      variableName: 'hitPoints',
      baseValue: { calculation: '33' },
    }
  ]
}

const actionTargetCreature2 = {
  _id: targetCreature2Id,
  props: [
    {
      _id: targetCreature2HitPointsId,
      type: 'attribute',
      name: 'Hit Points',
      attributeType: 'healthBar',
      variableName: 'hitPoints',
      baseValue: { calculation: '47' },
    }
  ]
}

describe('Apply Damage Properties', function () {
  // Increase timeout
  this.timeout(8000);

  before(async function () {
    await removeAllCreaturesAndProps();
    await createTestCreature(actionTestCreature);
    await createTestCreature(actionTargetCreature);
    await createTestCreature(actionTargetCreature2);
  });

  it('Damages self', async function () {
    const action = await runActionById(damageSelfId);
    assert.exists(action);
    assert.deepEqual(allMutations(action), [{
      contents: [
        {
          inline: true,
          name: 'Damage',
          value: '1d12 [6] + 7',
        }
      ],
      targetIds: [creatureId],
    }, {
      contents: [{
        inline: true,
        name: 'Attribute damaged',
        value: '−13 Hit Points',
      }],
      updates: [
        {
          propId: selfHitPointsId,
          type: 'attribute',
          inc: { damage: 13, value: -13 },
        },
      ],
      targetIds: [creatureId],
    }]);
  });

  it('Damages a single target', async function () {
    const action = await runActionById(damageTargetId, [targetCreatureId]);
    assert.exists(action);
    assert.deepEqual(allMutations(action), [{
      contents: [
        {
          inline: true,
          name: 'Damage',
          value: '2d6 [3, 4] + 7',
        }
      ],
      targetIds: [targetCreatureId],
    }, {
      contents: [
        {
          inline: true,
          name: 'Attribute damaged',
          value: '−14 Hit Points',
        }
      ],
      targetIds: [targetCreatureId],
      updates: [
        {
          propId: targetCreatureHitPointsId,
          type: 'attribute',
          inc: { damage: 14, value: -14 },
        },
      ],
    }]);
  });

  it('Damages multiple targets', async function () {
    const action = await runActionById(damageTargetId, [
      targetCreatureId, targetCreature2Id
    ]);
    assert.exists(action);
    assert.deepEqual(allMutations(action), [{
      contents: [
        {
          inline: true,
          name: 'Damage',
          value: '2d6 [3, 4] + 7',
        }
      ],
      targetIds: [
        targetCreatureId,
        targetCreature2Id,
      ],
    }, {
      contents: [
        {
          inline: true,
          name: 'Attribute damaged',
          value: '−14 Hit Points',
        }
      ],
      targetIds: [targetCreatureId],
      updates: [
        {
          propId: targetCreatureHitPointsId,
          type: 'attribute',
          inc: { damage: 14, value: -14 },
        },
      ],
    }, {
      contents: [
        {
          inline: true,
          name: 'Attribute damaged',
          value: '−14 Hit Points',
        }
      ],
      targetIds: [targetCreature2Id],
      updates: [
        {
          propId: targetCreature2HitPointsId,
          type: 'attribute',
          inc: { damage: 14, value: -14 },
        },
      ],
    }]);
  });
});

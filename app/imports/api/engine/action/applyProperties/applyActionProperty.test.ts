import { assert } from 'chai';
import {
  allLogContent,
  allMutations,
  allUpdates,
  createTestCreature,
  getRandomIds,
  removeAllCreaturesAndProps,
  runActionById
} from '/imports/api/engine/action/functions/actionEngineTest.testFn';
import { LogContent, Mutation, Update } from '/imports/api/engine/action/tasks/TaskResult';
import Alea from 'alea';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';

const [
  creatureId, targetCreatureId, targetCreature2Id, emptyActionId, selfActionId, attackActionId,
  usesActionId, attackMissId, attackNoTargetId, usesResourcesActionId, ammoId, resourceAttId,
  consumeAmmoId, consumeResourceId, noUsesActionId, insufficientResourcesActionId,
  attributeResetByEventId, eventActionId, advantageAttackId, advantageEffectId, disadvantageAttackId, disadvantageEffectId,
] = getRandomIds(100);

const actionTestCreature = {
  _id: creatureId,
  props: [
    // Empty
    {
      _id: emptyActionId,
      type: 'action',
      summary: { text: 'Summary text 1 + 1 = {1 + 1}' }
    },
    // Attack that targets self
    {
      _id: selfActionId,
      type: 'action',
      target: 'self',
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
      attackRoll: { calculation: '-5' },
    },
    // Attack that has Advantage
    {
      _id: advantageAttackId,
      type: 'action',
      attackRoll: { calculation: '0' },
      tags: ['hasAdvantage'],
    },
    {
      _id: advantageEffectId,
      type: 'effect',
      operation: 'advantage',
      targetByTags: true,
      targetTags: ['hasAdvantage'],
    },
    // Attack that has Disadvantage
    {
      _id: disadvantageAttackId,
      type: 'action',
      attackRoll: { calculation: '0' },
      tags: ['hasDisadvantage'],
    },
    {
      _id: disadvantageEffectId,
      type: 'effect',
      operation: 'disadvantage',
      targetByTags: true,
      targetTags: ['hasDisadvantage'],
    },
    // Attack that has no target
    {
      _id: attackNoTargetId,
      type: 'action',
      attackRoll: { calculation: '1' },
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
    // Not enough uses
    {
      _id: noUsesActionId,
      type: 'action',
      uses: { calculation: '5' },
      usesUsed: 5,
      reset: 'longRest',
    },
    // Uses Resources
    {
      _id: ammoId,
      type: 'item',
      quantity: 12,
      tags: ['ammo']
    },
    {
      _id: resourceAttId,
      type: 'attribute',
      name: 'Resource Name',
      attributeType: 'stat',
      baseValue: { calculation: '7' },
      variableName: 'resourceVar',
    },
    {
      _id: usesResourcesActionId,
      type: 'action',
      resources: {
        itemsConsumed: [{
          _id: consumeAmmoId,
          tag: 'ammo',
          quantity: { calculation: '3' },
          itemId: ammoId,
        }],
        attributesConsumed: [{
          _id: consumeResourceId,
          variableName: 'resourceVar',
          quantity: { calculation: '2' },
        }]
      }
    },
    {
      _id: insufficientResourcesActionId,
      type: 'action',
      resources: {
        attributesConsumed: [{
          _id: consumeResourceId,
          variableName: 'resourceVar',
          quantity: { calculation: '9001' },
        }]
      }
    },
    // Events and resetting attributes
    {
      _id: attributeResetByEventId,
      type: 'attribute',
      name: 'Attribute Reset By testEvent Event',
      attributeType: 'stat',
      baseValue: { calculation: '27' },
      damage: 13,
      variableName: 'resetByEventAtt',
      reset: 'testEvent'
    },
    {
      _id: eventActionId,
      type: 'action',
      actionType: 'event',
      variableName: 'testEvent',
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

  it('should generate random numbers reliably given consistent seeds', function () {
    const aleaFraction = Alea('test', 'seeds');
    const randomNumbers = [aleaFraction(), aleaFraction(), aleaFraction()];
    assert.deepEqual(randomNumbers, [
      0.19889510236680508, 0.9176857066340744, 0.042551583144813776
    ]);
  });

  it('should run empty actions', async function () {
    const action = await runActionById(emptyActionId);
    assert.exists(action);
    assert.deepEqual(allMutations(action), [{
      contents: [{
        name: 'Action',
        value: 'Summary text 1 + 1 = 2',
      }],
      targetIds: [],
    }]);
  });

  it('should target self when set', async function () {
    const action = await runActionById(selfActionId);
    assert.exists(action);
    assert.deepEqual(allMutations(action), [{
      contents: [{
        name: 'Action',
      }],
      targetIds: [creatureId],
    }]);
  });

  it('should make attack rolls against no targets', async function () {
    const action = await runActionById(attackNoTargetId, []);
    const expectedMutations: Mutation[] = [
      {
        contents: [{ name: 'Action' }],
        targetIds: [],
      }, {
        contents: [{
          name: 'To Hit',
          value: '1d20 [10] + 1\n**11**',
          inline: true,
        }],
        targetIds: [],
      }
    ];
    assert.deepEqual(allMutations(action), expectedMutations);
  })

  it('should make attack rolls against multiple creatures', async function () {
    const action = await runActionById(attackActionId, [
      targetCreatureId,
      targetCreature2Id,
    ]);
    const expectedMutations: Mutation[] = [
      {
        contents: [{ name: 'Action' }],
        targetIds: [targetCreatureId, targetCreature2Id]
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
      },
    ];
    assert.deepEqual(allMutations(action), expectedMutations);
  });

  it('should make attack rolls that use uses', async function () {
    const action = await runActionById(usesActionId, [targetCreatureId]);
    const expectedUpdates: Update[] = [
      {
        propId: usesActionId,
        type: 'action',
        inc: { usesUsed: 1, usesLeft: -1 },
      }
    ]
    assert.deepEqual(allUpdates(action), expectedUpdates);
  });

  it('should fail to make attacks that have no uses left', async function () {
    const action = await runActionById(noUsesActionId, [targetCreatureId]);
    const expectedContent: LogContent[] = [
      {
        name: 'Action'
      }, {
        name: 'Error',
        value: 'Action does not have enough uses left'
      }
    ]
    assert.deepEqual(allLogContent(action), expectedContent);
  });

  it('should make attack rolls that miss', async function () {
    const action = await runActionById(attackMissId, [targetCreatureId]);
    const expectedMutations: Mutation[] = [
      {
        contents: [{ name: 'Action' }],
        targetIds: [targetCreatureId],
      }, {
        contents: [{
          inline: true,
          name: 'Miss!',
          value: '1d20 [10] − 5\n**5**', // DiceCloud uses unicode minus
        }],
        targetIds: [targetCreatureId],
      }
    ];
    assert.deepEqual(allMutations(action), expectedMutations);
  });

  it('should make attack rolls that roll with advantage', async function () {
    const prop = await CreatureProperties.findOneAsync(advantageAttackId);
    assert.equal(prop.attackRoll.advantage, 1, 'The attack roll should have advantage');
    const action = await runActionById(advantageAttackId, [targetCreatureId]);
    const expectedMutations: Mutation[] = [
      {
        contents: [{ name: 'Action' }],
        targetIds: [targetCreatureId],
      }, {
        contents: [{
          inline: true,
          name: 'Hit! (Advantage)',
          value: '1d20 [ ~~10~~, 11 ] + 0\n**11**',
        }],
        targetIds: [targetCreatureId],
      }
    ];
    assert.deepEqual(allMutations(action), expectedMutations);
  });

  it('should make attack rolls that roll with disadvantage', async function () {
    const prop = await CreatureProperties.findOneAsync(disadvantageAttackId);
    assert.equal(prop.attackRoll.disadvantage, 1, 'The attack roll should have disadvantage');
    const action = await runActionById(disadvantageAttackId, [targetCreatureId]);
    const expectedMutations: Mutation[] = [
      {
        contents: [{ name: 'Action' }],
        targetIds: [targetCreatureId],
      }, {
        contents: [{
          inline: true,
          name: 'Hit! (Disadvantage)',
          value: '1d20 [ 10, ~~11~~ ] + 0\n**10**',
        }],
        targetIds: [targetCreatureId],
      }
    ];
    assert.deepEqual(allMutations(action), expectedMutations);
  });

  it('actions should consume resources', async function () {
    const action = await runActionById(usesResourcesActionId, []);
    const expectedMutations: Mutation[] = [
      {
        contents: [{ name: 'Action' }],
        targetIds: []
      },
      {
        contents: [{
          inline: true,
          name: 'Stat damaged',
          value: '−2 Resource Name',
        }],
        targetIds: [creatureId],
        updates: [{
          inc: {
            damage: 2,
            value: -2
          },
          propId: resourceAttId,
          type: 'attribute'
        }],
      },
      {
        targetIds: [],
        updates: [
          {
            inc: {
              quantity: -3
            },
            propId: ammoId,
            type: 'item',
          }
        ]
      }
    ];
    assert.deepEqual(allMutations(action), expectedMutations);
  });

  it('should handle insufficient resources', async function () {
    const action = await runActionById(insufficientResourcesActionId, []);
    const expectedMutations: Mutation[] = [
      {
        contents: [{
          name: 'Action'
        }, {
          name: 'Error',
          value: 'This creature doesn\'t have sufficient resources to perform this action',
        }],
        targetIds: [],
      },
    ];
    assert.deepEqual(allMutations(action), expectedMutations);
  });

  it('should reset attributes when events happen', async function () {
    const action = await runActionById(eventActionId, []);
    const expectedMutations: Mutation[] = [
      {
        contents: [{
          name: 'Action'
        }],
        targetIds: [],
      },
      {
        contents: [
          {
            inline: true,
            name: 'Stat restored',
            value: '+13 Attribute Reset By testEvent Event',
          },
        ],
        targetIds: [creatureId],
        updates: [
          {
            inc: {
              damage: -13,
              value: 13,
            },
            propId: attributeResetByEventId,
            type: 'attribute',
          },
        ],
      }
    ];
    assert.deepEqual(allMutations(action), expectedMutations);
  });

});

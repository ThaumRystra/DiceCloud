import { assert } from 'chai';
import {
  allLogContent,
  allMutations,
  allUpdates,
  createTestCreature,
  getRandomIds,
  removeAllCreaturesAndProps,
  runActionById,
  TestCreature
} from '/imports/api/engine/action/functions/actionEngineTest.testFn';
import { LogContent, Mutation, Update } from '/imports/api/engine/action/tasks/TaskResult';
import Alea from 'alea';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import inputProviderForTests, { critInputProvider } from '/imports/api/engine/action/functions/userInput/inputProviderForTests.testFn';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';

const [
  creatureId, targetCreatureId, targetCreature2Id, emptyActionId, selfActionId, attackActionId,
  usesActionId, attackMissId, attackNoTargetId, usesResourcesActionId, ammoId, resourceAttId,
  consumeAmmoId, consumeResourceId, noUsesActionId, insufficientResourcesActionId,
  attributeResetByEventId, eventActionId, advantageAttackId, advantageEffectId, disadvantageAttackId, disadvantageEffectId,
  stackedAdvantageAttackId, critCreatureId, critAttackId, critChanceCreatureId, critChanceAttackId,
] = getRandomIds(100);

// Returns fixed values for every roll of the 2d10 core dice
function fixedCoreRollProvider(values: number[]): InputProvider {
  return {
    ...inputProviderForTests,
    async rollDice(dice) {
      if (dice.length === 1 && dice[0].diceSize === 10) return [[...values]];
      return inputProviderForTests.rollDice(dice);
    },
  };
}

// A creature with no crit overrides
const critTestCreature: TestCreature = {
  _id: critCreatureId,
  props: [
    {
      _id: critAttackId,
      type: 'action',
      attackRoll: { calculation: '0' },
    },
  ],
}

// A creature with crit chance +2
const critChanceTestCreature: TestCreature = {
  _id: critChanceCreatureId,
  props: [
    {
      type: 'attribute',
      attributeType: 'stat',
      variableName: 'critChance',
      baseValue: { calculation: '2' },
    },
    {
      _id: critChanceAttackId,
      type: 'action',
      attackRoll: { calculation: '0' },
    },
  ],
}

const actionTestCreature: TestCreature = {
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
    // Attack with stacked advantage: +2, +1 (blank amount) and −1 nets +2
    {
      _id: stackedAdvantageAttackId,
      type: 'action',
      attackRoll: { calculation: '0' },
      tags: ['stackedAdvantage'],
    },
    {
      type: 'effect',
      operation: 'advantage',
      amount: { calculation: '2' },
      targetByTags: true,
      targetTags: ['stackedAdvantage'],
    },
    {
      type: 'effect',
      operation: 'advantage',
      targetByTags: true,
      targetTags: ['stackedAdvantage'],
    },
    {
      type: 'effect',
      operation: 'disadvantage',
      amount: { calculation: '1' },
      targetByTags: true,
      targetTags: ['stackedAdvantage'],
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
        }],
        conditions: [],
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
        }],
        itemsConsumed: [],
        conditions: [],
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

const actionTargetCreature: TestCreature = {
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

const actionTargetCreature2: TestCreature = {
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
    await createTestCreature(critTestCreature);
    await createTestCreature(critChanceTestCreature);
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
          value: '2d10 [ 5, 6 ] + 1\n**12**',
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
          value: '2d10 [ 5, 6 ] + 10\n**21**',
        }],
        targetIds: [targetCreatureId],
      }, {
        contents: [{
          inline: true,
          name: 'Hit!',
          value: '2d10 [ 5, 6 ] + 10\n**21**',
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
          value: '2d10 [ 5, 6 ] − 5\n**6**', // DiceCloud uses unicode minus
        }],
        targetIds: [targetCreatureId],
      }
    ];
    assert.deepEqual(allMutations(action), expectedMutations);
  });

  it('should make attack rolls that roll with advantage', async function () {
    const prop = await CreatureProperties.findOneAsync(advantageAttackId);
    assert(prop);
    assert(prop.type === 'action')
    assert.equal(prop.attackRoll?.advantage, 1, 'The attack roll should have advantage');
    const action = await runActionById(advantageAttackId, [targetCreatureId]);
    const expectedMutations: Mutation[] = [
      {
        contents: [{ name: 'Action' }],
        targetIds: [targetCreatureId],
      }, {
        contents: [{
          inline: true,
          name: 'Hit! (Advantage +1)',
          value: 'Advantage +1\n2d10 [ ~~5~~, 6, 7 ] + 0\n**13**',
        }],
        targetIds: [targetCreatureId],
      }
    ];
    assert.deepEqual(allMutations(action), expectedMutations);
  });

  it('should make attack rolls that roll with disadvantage', async function () {
    const prop = await CreatureProperties.findOneAsync(disadvantageAttackId);
    assert(prop);
    assert(prop.type === 'action');
    assert.equal(prop.attackRoll?.disadvantage, 1, 'The attack roll should have disadvantage');
    const action = await runActionById(disadvantageAttackId, [targetCreatureId]);
    const expectedMutations: Mutation[] = [
      {
        contents: [{ name: 'Action' }],
        targetIds: [targetCreatureId],
      }, {
        contents: [{
          inline: true,
          name: 'Hit! (Disadvantage −1)',
          value: 'Disadvantage −1\n2d10 [ 5, 6, ~~7~~ ] + 0\n**11**',
        }],
        targetIds: [targetCreatureId],
      }
    ];
    assert.deepEqual(allMutations(action), expectedMutations);
  });

  it('should sum stacked advantage and disadvantage on attack rolls', async function () {
    const prop = await CreatureProperties.findOneAsync(stackedAdvantageAttackId);
    assert(prop);
    assert(prop.type === 'action');
    assert.equal(prop.attackRoll?.advantage, 3, 'Advantage amounts 2 and blank should sum to 3');
    assert.equal(prop.attackRoll?.disadvantage, 1, 'Disadvantage amount should be 1');
    const action = await runActionById(stackedAdvantageAttackId, [targetCreatureId]);
    assert.deepEqual(allMutations(action)[1].contents, [{
      inline: true,
      name: 'Hit! (Advantage +2)',
      value: 'Advantage +2\n2d10 [ ~~5~~, ~~6~~, 7, 8 ] + 0\n**15**',
    }]);
  });

  it('should crit on a kept sum of 20 with no crit chance', async function () {
    const action = await runActionById(critAttackId, [targetCreatureId], critInputProvider);
    assert.deepEqual(allMutations(action)[1].contents, [{
      inline: true,
      name: 'Critical Hit!',
      value: '2d10 [ 10, 10 ] + 0\n**20**',
    }]);
    const noCrit = await runActionById(critAttackId, [targetCreatureId], fixedCoreRollProvider([10, 9]));
    assert.equal(allMutations(noCrit)[1].contents?.[0].name, 'Hit!', '19 should not crit without crit chance');
  });

  it('should crit on a kept sum of 18 with crit chance 2', async function () {
    const action = await runActionById(critChanceAttackId, [targetCreatureId], fixedCoreRollProvider([9, 9]));
    assert.deepEqual(allMutations(action)[1].contents, [{
      inline: true,
      name: 'Critical Hit!',
      value: '2d10 [ 9, 9 ] + 0\n**18**',
    }]);
    const noCrit = await runActionById(critChanceAttackId, [targetCreatureId], fixedCoreRollProvider([9, 8]));
    assert.equal(allMutations(noCrit)[1].contents?.[0].name, 'Hit!', '17 should not crit with crit chance 2');
  });

  it('should not critically miss on a low roll', async function () {
    const action = await runActionById(critAttackId, [targetCreatureId], fixedCoreRollProvider([1, 1]));
    assert.deepEqual(allMutations(action)[1].contents, [{
      inline: true,
      name: 'Miss!',
      value: '2d10 [ 1, 1 ] + 0\n**2**',
    }]);
    const noTarget = await runActionById(critAttackId, [], fixedCoreRollProvider([1, 1]));
    assert.equal(allMutations(noTarget)[1].contents?.[0].name, 'To Hit');
  });

  it('should let ~criticalHitTarget override the crit target', async function () {
    // The test creature sets ~criticalHitTarget to 21
    const action = await runActionById(attackActionId, [targetCreatureId], critInputProvider);
    assert.deepEqual(allMutations(action)[1].contents, [{
      inline: true,
      name: 'Hit!',
      value: '2d10 [ 10, 10 ] + 10\n**30**',
    }]);
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

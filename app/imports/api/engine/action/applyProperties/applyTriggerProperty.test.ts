import { assert } from 'chai';
import {
  allLogContent,
  createTestCreature,
  getRandomIds,
  removeAllCreaturesAndProps,
  runActionById,
  TestCreature
} from '/imports/api/engine/action/functions/actionEngineTest.testFn';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';

const [
  creatureId, targetCreatureId, targetCreature2Id,
] = getRandomIds(100);

const idMap: Record<string, string> = {};

const propsWithTriggers = ([
  { type: 'action' },
  {
    type: 'adjustment',
    target: 'target',
    stat: 'strength',
    operation: 'increment',
    amount: { calculation: '2' }
  },
  {
    type: 'branch',
    branchType: 'if',
    condition: { calculation: 'true' },
  },
  { type: 'buff' },
  { type: 'buffRemover' },
  {
    type: 'damage',
    amount: { calculation: '1d13 + 3' },
  },
  { type: 'note' },
  {
    type: 'roll',
    roll: { calculation: '1d20' },
  },
  {
    type: 'savingThrow',
    stat: 'strengthSave',
    dc: { calculation: '10' },
  },
  { type: 'spell' },
] as any[]).map(prop => {
  idMap[prop.type] = Random.id();
  idMap[prop.type + 'Before'] = Random.id();
  idMap[prop.type + 'After'] = Random.id();
  idMap[prop.type + 'AfterChildren'] = Random.id();
  prop._id = idMap[prop.type];
  prop.name = prop.type;
  return prop;
});

const actionTestCreature: TestCreature = {
  _id: creatureId,
  props: propsWithTriggers.map(prop => [
    // Props with triggers
    {
      tags: ['trigger tag'],
      children: [
        {
          type: 'note',
          name: 'Note Child'
        }
      ],
      ...prop,
    }, {
      _id: idMap[prop.type + 'Before'],
      type: 'trigger',
      targetTags: ['trigger tag'],
      name: `Before ${prop.type} Trigger`,
      event: 'doActionProperty',
      actionPropertyType: prop.type,
      timing: 'before',
    }, {
      _id: idMap[prop.type + 'After'],
      type: 'trigger',
      targetTags: ['trigger tag'],
      name: `After ${prop.type} Trigger`,
      event: 'doActionProperty',
      actionPropertyType: prop.type,
      timing: 'after',
    }, {
      _id: idMap[prop.type + 'AfterChildren'],
      type: 'trigger',
      targetTags: ['trigger tag'],
      name: `After ${prop.type} Children Trigger`,
      event: 'doActionProperty',
      actionPropertyType: prop.type,
      timing: 'afterChildren',
    },
  ]).flat(),
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

describe('Triggers', function () {
  // Increase timeout
  this.timeout(8000);

  before(async function () {
    await removeAllCreaturesAndProps();
    await createTestCreature(actionTestCreature);
    await createTestCreature(actionTargetCreature);
    await createTestCreature(actionTargetCreature2);
  });

  it('should run triggers on all props', async function () {
    const expectedLogs: any[] = [
      {
        type: 'action',
        content: [{ name: 'action' }],
      }, {
        type: 'adjustment',
        content: [{ inline: true, name: 'Attribute damage', value: 'strength 2' }],
      }, {
        type: 'branch',
        content: [],
      }, {
        type: 'buff',
        content: [{ name: 'buff' }],
        noChildren: true,
      }, {
        type: 'buffRemover',
        content: [{ name: 'buffRemover' }],
      }, {
        type: 'damage',
        content: [{
          inline: true, name: 'Damage', value: '1d13 [7] + 3\n**10** slashing damage'
        }],
      }, {
        type: 'note',
        content: [{ name: 'note' }],
      }, {
        type: 'roll',
        content: [{
          name: 'roll', inline: true, value: '1d20 [10]\n**10**'
        }],
      }, {
        type: 'savingThrow',
        content: [{ name: 'savingThrow', inline: true, value: 'DC **10**' }],
      }, {
        type: 'spell',
        content: [{ name: 'spell' }],
      },
    ];
    for (const log of expectedLogs) try {
      const type = log.type;
      const actionProp = CreatureProperties.findOne(idMap[type]);
      assert.deepEqual(actionProp?.triggerIds, {
        before: [idMap[type + 'Before']],
        after: [idMap[type + 'After']],
        afterChildren: [idMap[type + 'AfterChildren']],
      }, 'Prop\'s triggerIds should be set');
      const action = await runActionById(idMap[type]);
      assert.exists(action);
      assert.deepEqual(allLogContent(action), [
        {
          name: `Before ${type} Trigger`,
        },
        ...log.content,
        {
          name: `After ${type} Trigger`,
        },
        ...log.noChildren ? [] : [{
          name: 'Note Child',
        }],
        {
          name: `After ${type} Children Trigger`,
        },
      ]);
    } catch (e) {
      console.error(`failed when running ${log.type}`);
      throw e
    }
  });

  it('Targets all properties when no tags are specified', async function () {
    const [creatureId, actionId, triggerId] = getRandomIds(3);
    const creature: TestCreature = {
      _id: creatureId,
      props: [
        {
          _id: actionId,
          type: 'action',
          name: 'Action',
          children: [{
            type: 'note',
            summary: { text: 'note summary {1 + 2}' }
          }]
        }, {
          _id: triggerId,
          type: 'trigger',
          targetTags: [],
          name: 'Before Trigger',
          event: 'doActionProperty',
          actionPropertyType: 'action',
          timing: 'before',
        }
      ],
    };
    await createTestCreature(creature);
    const action = await runActionById(actionId, [creature._id]);
    const actionProp = CreatureProperties.findOne(actionId);
    assert.exists(actionProp);
    assert.deepEqual(actionProp?.triggerIds, {
      before: [triggerId],
    });
    assert.deepEqual(allLogContent(action), [{
      name: 'Before Trigger',
    }, {
      name: 'Action',
    }, {
      value: 'note summary 3',
    }]);
  });
});

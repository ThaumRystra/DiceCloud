import { assert } from 'chai';
import {
  allLogContent,
  createTestCreature,
  getRandomIds,
  removeAllCreaturesAndProps,
  runActionById
} from '/imports/api/engine/action/functions/actionEngineTest.testFn';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';

const [
  creatureId, targetCreatureId, targetCreature2Id, actionWithTriggerId, triggerBeforeActionId,
  triggerAfterActionId, triggerAfterActionChildrenId
] = getRandomIds(100);

const actionTestCreature = {
  _id: creatureId,
  props: [
    // Action with triggers
    {
      _id: actionWithTriggerId,
      type: 'action',
      tags: ['trigger tag'],
      children: [
        {
          type: 'note',
          name: 'Action Child'
        }
      ],
    },
    {
      _id: triggerBeforeActionId,
      type: 'trigger',
      targetTags: ['trigger tag'],
      name: 'Before Action Trigger',
      event: 'doActionProperty',
      actionPropertyType: 'action',
      timing: 'before',
    },
    {
      _id: triggerAfterActionId,
      type: 'trigger',
      targetTags: ['trigger tag'],
      name: 'After Action Trigger',
      event: 'doActionProperty',
      actionPropertyType: 'action',
      timing: 'after',
    },
    {
      _id: triggerAfterActionChildrenId,
      type: 'trigger',
      targetTags: ['trigger tag'],
      name: 'After Action Children Trigger',
      event: 'doActionProperty',
      actionPropertyType: 'action',
      timing: 'afterChildren',
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

describe('Triggers', function () {
  // Increase timeout
  this.timeout(8000);

  before(async function () {
    await removeAllCreaturesAndProps();
    await createTestCreature(actionTestCreature);
    await createTestCreature(actionTargetCreature);
    await createTestCreature(actionTargetCreature2);
  });

  it('should run triggers on actions', async function () {
    const actionProp = CreatureProperties.findOne(actionWithTriggerId);
    assert.deepEqual(actionProp.triggerIds, {
      before: [triggerBeforeActionId],
      after: [triggerAfterActionId],
      afterChildren: [triggerAfterActionChildrenId],
    }, 'Prop\'s triggerIds should be set');
    const action = await runActionById(actionWithTriggerId);
    assert.exists(action);
    assert.deepEqual(allLogContent(action), [
      {
        name: 'Before Action Trigger',
      }, {
        name: 'Action',
      }, {
        name: 'After Action Trigger',
      }, {
        name: 'Action Child',
      }, {
        name: 'After Action Children Trigger',
      },
    ]);
  });
});

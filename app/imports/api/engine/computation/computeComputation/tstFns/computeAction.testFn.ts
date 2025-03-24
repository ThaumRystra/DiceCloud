import { assert } from 'chai';
import computeCreatureComputation from '/imports/api/engine/computation/computeCreatureComputation';
import buildTestComputation from './buildTestComputation';
import type { ForestProp } from '/imports/api/engine/computation/utility/propsFromForest.testFn';
import { CreaturePropertyTypes } from '/imports/api/creature/creatureProperties/CreatureProperties';

export default async function () {
  const computation = buildTestComputation({
    _id: 'testCreatureId',
    props: testProperties,
  });
  await computeCreatureComputation(computation);

  const prop = computation.propsById['actionId'] as CreaturePropertyTypes['action'];
  assert.equal(prop.summary?.value, 'test summary 3 without referencing anything 7');
  assert.equal(prop.description?.value, 'test description 12 with reference 0.25 prop');
  assert.equal(prop.uses?.value, 7);
  assert.equal(prop.usesLeft, 2);

  const rolled = computation.propsById['rolledDescriptionId'] as CreaturePropertyTypes['action'];
  assert.equal(rolled.summary?.value, 'test roll gets compiled 8 properly');

  const itemConsumed = prop.resources.itemsConsumed[0];
  assert.exists(itemConsumed);
  assert.equal(itemConsumed.quantity?.value, 3);
  assert.equal(itemConsumed.available, 27);
  assert.equal(itemConsumed.itemName, 'Arrow');
  assert.equal(itemConsumed.itemIcon?.name, 'itemIcon');
  assert.equal(itemConsumed.itemColor, '#fff');

  const attConsumed = prop.resources.attributesConsumed[0];
  assert.exists(attConsumed);
  assert.equal(attConsumed.quantity?.value, 4);
  assert.equal(attConsumed.available, 9);
  assert.equal(attConsumed.statName, 'Resource Var');
}

const testProperties: ForestProp[] = [
  {
    _id: 'actionId',
    type: 'action',
    summary: {
      text: 'test summary {1 + 2} without referencing anything {3 + 4}',
    },
    description: {
      text: 'test description {inlineRef * 2} with reference {1/4} prop',
    },
    resources: {
      itemsConsumed: [{
        _id: 'itemConsumedId',
        itemId: 'arrowId',
        tag: 'arrow',
        quantity: {
          calculation: 'itemConsumedQuantity',
        },
      }],
      attributesConsumed: [{
        _id: 'attConsumedId',
        variableName: 'resourceVar',
        quantity: {
          calculation: 'resourceConsumedQuantity'
        }
      }],
      conditions: [],
    },
    uses: {
      calculation: 'nonExistentProperty + 7',
    },
    usesUsed: 5,
    left: 1,
    right: 2,
  },
  {
    _id: 'rolledDescriptionId',
    type: 'action',
    summary: {
      text: 'test roll gets compiled {4 + (2 + 2)} properly',
    },
    left: 3,
    right: 4,
  },
  {
    _id: 'numItemsConsumedId',
    type: 'attribute',
    variableName: 'itemConsumedQuantity',
    baseValue: {
      calculation: '3',
    },
    left: 5,
    right: 6,
  },
  {
    _id: 'numResourceConsumedId',
    type: 'attribute',
    variableName: 'resourceConsumedQuantity',
    baseValue: {
      calculation: '4',
    },
    left: 7,
    right: 8,
  },
  {
    _id: 'resourceVarId',
    name: 'Resource Var',
    type: 'attribute',
    variableName: 'resourceVar',
    baseValue: {
      calculation: '9',
    },
    left: 9,
    right: 10,
  },
  {
    _id: 'inlineRefResourceId',
    type: 'attribute',
    variableName: 'inlineRef',
    baseValue: {
      calculation: '1 + 5',
    },
    left: 11,
    right: 12,
  },
  {
    _id: 'arrowId',
    type: 'item',
    name: 'Arrow',
    quantity: 27,
    icon: { name: 'itemIcon', shape: 'itemIconShape' },
    color: '#fff',
    left: 13,
    right: 14,
  },
];

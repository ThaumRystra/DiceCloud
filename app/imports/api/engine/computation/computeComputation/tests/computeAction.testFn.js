import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation';
import { assert } from 'chai';
import computeCreatureComputation from '../../computeCreatureComputation';
import clean from '../../utility/cleanProp.testFn';

export default async function () {
  const computation = buildComputationFromProps(testProperties);
  await computeCreatureComputation(computation);

  const prop = computation.propsById['actionId'];
  assert.equal(prop.summary.value, 'test summary 3 without referencing anything 7');
  assert.equal(prop.description.value, 'test description 12 with reference 0.25 prop');
  assert.equal(prop.uses.value, 7);
  assert.equal(prop.usesLeft, 2);

  const rolled = computation.propsById['rolledDescriptionId'];
  assert.equal(rolled.summary.value, 'test roll gets compiled 8 properly');

  const itemConsumed = prop.resources.itemsConsumed[0];
  assert.equal(itemConsumed.quantity.value, 3);
  assert.equal(itemConsumed.available, 27);
  assert.equal(itemConsumed.itemName, 'Arrow');
  assert.equal(itemConsumed.itemIcon, 'itemIcon');
  assert.equal(itemConsumed.itemColor, 'itemColor');

  const attConsumed = prop.resources.attributesConsumed[0];
  assert.equal(attConsumed.quantity.value, 4);
  assert.equal(attConsumed.available, 9);
  assert.equal(attConsumed.statName, 'Resource Var');
}

var testProperties = [
  clean({
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
    },
    uses: {
      calculation: 'nonExistentProperty + 7',
    },
    usesUsed: 5,
    left: 1,
    right: 2,
  }),
  clean({
    _id: 'rolledDescriptionId',
    type: 'action',
    summary: {
      text: 'test roll gets compiled {4 + (2 + 2)} properly',
    },
    left: 3,
    right: 4,
  }),
  clean({
    _id: 'numItemsConumedId',
    type: 'attribute',
    variableName: 'itemConsumedQuantity',
    baseValue: {
      calculation: '3',
    },
    left: 5,
    right: 6,
  }),
  clean({
    _id: 'numResourceConumedId',
    type: 'attribute',
    variableName: 'resourceConsumedQuantity',
    baseValue: {
      calculation: '4',
    },
    left: 7,
    right: 8,
  }),
  clean({
    _id: 'resourceVarId',
    name: 'Resource Var',
    type: 'attribute',
    variableName: 'resourceVar',
    baseValue: {
      calculation: '9',
    },
    left: 9,
    right: 10,
  }),
  clean({
    _id: 'inlineRefResourceId',
    type: 'attribute',
    variableName: 'inlineRef',
    baseValue: {
      calculation: '1 + 5',
    },
    left: 11,
    right: 12,
  }),
  clean({
    _id: 'arrowId',
    type: 'item',
    name: 'Arrow',
    quantity: 27,
    icon: 'itemIcon',
    color: 'itemColor',
    left: 13,
    right: 14,
  }),
];

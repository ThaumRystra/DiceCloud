import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation';
import { assert } from 'chai';
import computeCreatureComputation from '../../computeCreatureComputation';
import clean from '../../utility/cleanProp.testFn';
import { applyNestedSetProperties, compareOrder } from '/imports/api/parenting/parentingFunctions';

export default async function () {
  const computation = buildComputationFromProps(testProperties);
  await computeCreatureComputation(computation);
  const prop = id => computation.propsById[id];
  const scope = id => computation.scope[id].value;

  assert.equal(scope('weightEquipment'), 2);
  assert.equal(scope('valueEquipment'), 3);

  assert.equal(scope('itemsAttuned'), 1);
  assert.equal(prop('childContainerId').carriedWeight, 69, 'Calculates container carried weight correctly');
  assert.equal(prop('childContainerId').contentsWeight, 69, 'Calculates container contents weight correctly');

  assert.equal(scope('weightCarried'), 104);
  assert.equal(scope('valueCarried'), 129);

  assert.equal(scope('weightTotal'), 104);
  assert.equal(scope('valueTotal'), 129);
}

var testProperties = [
  clean({
    _id: 'equippedAttunedItemId',
    type: 'item',
    equipped: true,
    attuned: true,
    weight: 2,
    value: 3,
  }),
  clean({
    _id: 'containerId',
    type: 'container',
    carried: true,
    weight: 5,
    value: 7,
  }),
  clean({
    _id: 'childItemId',
    type: 'item',
    weight: 17,
    value: 19,
    parentId: 'containerId',
  }),
  clean({
    _id: 'grandchildItemId',
    type: 'item',
    weight: 23, // 69 total
    value: 29, // 87 total
    quantity: 3,
    parentId: 'childContainerId',
  }),
  clean({
    _id: 'childContainerId',
    type: 'container',
    carried: true,
    weight: 11,
    value: 13,
    parentId: 'containerId',
  }),
];
applyNestedSetProperties(testProperties);
testProperties.sort(compareOrder);

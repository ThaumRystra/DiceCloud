import { buildComputationFromProps } from '/imports/api/creature/computation/newEngine/buildCreatureComputation.js';
import { assert } from 'chai';
import computeCreatureComputation from '../../computeCreatureComputation.js';
import clean from '../../utility/cleanProp.testFn.js';

export default function(){
  const computation = buildComputationFromProps(testProperties);
  computeCreatureComputation(computation);
  const prop = id => computation.propsById[id];
  const scope = id => computation.scope[id].value;
  console.log(computation.scope);

  assert.equal(scope('weightEquipment'), 2);
  assert.equal(scope('valueEquipment'), 3);

  assert.equal(scope('itemsAttuned'), 1);

  assert.equal(prop('childContainerId').carriedWeight, 23);
  assert.equal(prop('childContainerId').contentsWeight, 23);

  assert.equal(scope('weightCarried'), 58);

  assert.equal(scope('weightCarried'), 58);
  assert.equal(scope('valueCarried'), 71);

  assert.equal(scope('weightTotal'), 58);
  assert.equal(scope('valueTotal'), 71);
}

var testProperties = [
  clean({
    _id: 'equippedAttunedItemId',
    type: 'item',
    equipped: true,
    attuned: true,
    weight: 2,
    value: 3,
    ancestors: [{id: 'charId'}],
  }),
  clean({
    _id: 'containerId',
    type: 'container',
    carried: true,
    weight: 5,
    value: 7,
    ancestors: [{id: 'charId'}],
  }),
  clean({
    _id: 'childContainerId',
    type: 'container',
    carried: true,
    weight: 11,
    value: 13,
    ancestors: [{id: 'charId'}, {id: 'containerId'}],
  }),
  clean({
    _id: 'childItemId',
    type: 'item',
    weight: 17,
    value: 19,
    ancestors: [{id: 'charId'}, {id: 'containerId'}],
  }),
  clean({
    _id: 'grandchildItemId',
    type: 'item',
    weight: 23,
    value: 29,
    ancestors: [{id: 'charId'}, {id: 'containerId'}, {id: 'childContainerId'}],
  }),
];

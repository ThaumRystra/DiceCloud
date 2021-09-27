import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation.js';
import { assert } from 'chai';
import clean from '../../utility/cleanProp.testFn.js';

export default function(){
  const computation = buildComputationFromProps(testProperties);
  const hasLink = computation.dependencyGraph.hasLink;

  assert.isTrue(
    !!hasLink('weightEquipment', 'equippedAttunedItemId'),
    'weight of equipment depends on equipped items'
  );
  assert.isTrue(
    !!hasLink('valueEquipment', 'equippedAttunedItemId'),
    'value of equipment depends on equipped items'
  );
  assert.isTrue(
    !!hasLink('weightTotal', 'equippedAttunedItemId'),
    'weightTotal depends on equipped items'
  );
  assert.isTrue(
    !!hasLink('valueTotal', 'equippedAttunedItemId'),
    'valueTotal depends on equipped items'
  );
  assert.isTrue(
    !!hasLink('weightCarried', 'equippedAttunedItemId'),
    'weightCarried depends on equipped items'
  );
  assert.isTrue(
    !!hasLink('valueCarried', 'equippedAttunedItemId'),
    'valueCarried depends on equipped items'
  );
  assert.isTrue(
    !!hasLink('weightCarried', 'containerId'),
    'weightCarried depends on top level containers'
  );
  assert.isTrue(
    !!hasLink('valueCarried', 'containerId'),
    'valueCarried depends on top level containers'
  );
  assert.isFalse(
    !!hasLink('weightCarried', 'childContainerId'),
    'weightCarried does not depend on nested containers'
  );
  assert.isFalse(
    !!hasLink('valueCarried', 'childContainerId'),
    'valueCarried does not depend on nested containers'
  );
  assert.isTrue(
    !!hasLink('containerId', 'childContainerId'),
    'containers depend on their child containers'
  );
  assert.isTrue(
    !!hasLink('childContainerId', 'grandchildItemId'),
    'containers depend on their child items'
  );
}

var testProperties = [
  clean({
    _id: 'equippedAttunedItemId',
    type: 'item',
    equipped: true,
    attuned: true,
    ancestors: [{id: 'charId'}],
  }),
  clean({
    _id: 'containerId',
    type: 'container',
    carried: true,
    ancestors: [{id: 'charId'}],
  }),
  clean({
    _id: 'childContainerId',
    type: 'container',
    carried: true,
    ancestors: [{id: 'charId'}, {id: 'containerId'}],
  }),
  clean({
    _id: 'childItemId',
    type: 'item',
    ancestors: [{id: 'charId'}, {id: 'containerId'}],
  }),
  clean({
    _id: 'grandchildItemId',
    type: 'item',
    ancestors: [{id: 'charId'}, {id: 'containerId'}, {id: 'childContainerId'}],
  }),
];

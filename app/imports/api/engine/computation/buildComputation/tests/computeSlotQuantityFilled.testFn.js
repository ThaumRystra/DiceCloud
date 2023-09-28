import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation.js';
import { assert } from 'chai';
import clean from '../../utility/cleanProp.testFn.js';

export default function () {
  const computation = buildComputationFromProps(testProperties);
  const totalFilled = computation.propsById['slotId'].totalFilled;
  assert.equal(totalFilled, 4);
}

var testProperties = [
  // Slots
  clean({
    _id: 'slotId',
    type: 'propertySlot',
    left: 1,
    right: 8,
  }),
  // Children
  clean({
    _id: 'slotFillerId',
    type: 'folder',
    slotQuantityFilled: 3,
    slotFillerType: 'item',
    parentId: 'slotId',
    left: 2,
    right: 3,
  }),
  clean({
    _id: 'slotChildId',
    type: 'item',
    parentId: 'slotId',
    left: 4,
    right: 7,
  }),
  clean({
    _id: 'slotGrandchildId',
    type: 'effect',
    parentId: 'slotChildId',
    left: 5,
    right: 6,
  }),
];

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
    ancestors: [{ id: 'charId' }],
  }),
  // Children
  clean({
    _id: 'slotFillerId',
    type: 'folder',
    slotQuantityFilled: 3,
    slotFillerType: 'item',
    ancestors: [{ id: 'charId' }, { id: 'slotId' }],
  }),
  clean({
    _id: 'slotChildId',
    type: 'item',
    ancestors: [{ id: 'charId' }, { id: 'slotId' }],
  }),
  clean({
    _id: 'slotGrandchildId',
    type: 'effect',
    ancestors: [{ id: 'charId' }, { id: 'slotId' }, { id: 'slotChildId' }],
  }),
];

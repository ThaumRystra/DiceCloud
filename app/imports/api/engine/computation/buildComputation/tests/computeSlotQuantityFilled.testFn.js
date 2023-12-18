import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation';
import { assert } from 'chai';
import clean from '../../utility/cleanProp.testFn';
import { applyNestedSetProperties } from '/imports/api/parenting/parentingFunctions';

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
  }),
  // Children
  clean({
    _id: 'slotFillerId',
    type: 'folder',
    slotQuantityFilled: 3,
    slotFillerType: 'item',
    parentId: 'slotId',
  }),
  clean({
    _id: 'slotChildId',
    type: 'item',
    parentId: 'slotId',
  }),
  clean({
    _id: 'slotGrandchildId',
    type: 'effect',
    parentId: 'slotChildId',
  }),
];

applyNestedSetProperties(testProperties);

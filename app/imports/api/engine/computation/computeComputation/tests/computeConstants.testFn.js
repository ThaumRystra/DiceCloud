import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation';
import { assert } from 'chai';
import computeCreatureComputation from '../../computeCreatureComputation';
import clean from '../../utility/cleanProp.testFn';
import { applyNestedSetProperties } from '/imports/api/parenting/parentingFunctions';

export default async function () {
  const computation = buildComputationFromProps(testProperties);
  await computeCreatureComputation(computation);
  const prop = id => computation.propsById[id];
  assert.equal(prop('attId').value, 6);
}

var testProperties = [
  clean({
    _id: 'constId',
    type: 'constant',
    variableName: 'arrayConstant',
    calculation: '[2, 4, 6, 8, 10]',
  }),
  clean({
    _id: 'attId',
    type: 'attribute',
    baseValue: {
      calculation: 'arrayConstant[3]',
    },
  }),
];

applyNestedSetProperties(testProperties);

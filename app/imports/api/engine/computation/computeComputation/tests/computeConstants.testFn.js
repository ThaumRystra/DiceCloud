import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation.js';
import { assert } from 'chai';
import computeCreatureComputation from '../../computeCreatureComputation.js';
import clean from '../../utility/cleanProp.testFn.js';

export default function(){
  const computation = buildComputationFromProps(testProperties);
  computeCreatureComputation(computation);
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
    ancestors: [{id: 'charId'}],
  }),
];

import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation.js';
import { assert } from 'chai';
import computeCreatureComputation from '../../computeCreatureComputation.js';
import clean from '../../utility/cleanProp.testFn.js';

export default function(){
  const computation = buildComputationFromProps(testProperties);
  computeCreatureComputation(computation);
  const prop = id => computation.propsById[id];
  assert.equal(prop('strengthId').value, 26);
}

var testProperties = [
  clean({
    _id: 'strengthId',
    variableName: 'strength',
    type: 'attribute',
    attributeType: 'ability',
    baseValue: {
      calculation: '8'
    },
  }),
  clean({
    _id: 'strength2Id',
    variableName: 'strength',
    type: 'attribute',
    attributeType: 'ability',
    baseValue: {
      calculation: '10'
    },
  }),
  clean({
    _id: 'strengthBaseId',
    type: 'effect',
    operation: 'base',
    amount: {
      calculation: '10 + 2'
    },
    stats: ['strength'],
  }),
  clean({
    _id: 'strengthAddId',
    type: 'effect',
    operation: 'add',
    amount: {
      calculation: '1'
    },
    stats: ['strength'],
  }),
  clean({
    _id: 'strengthMulId',
    type: 'effect',
    operation: 'mul',
    amount: {
      calculation: '2'
    },
    stats: ['strength'],
  }),
];

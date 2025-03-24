import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation';
import { assert } from 'chai';
import computeCreatureComputation from '../../computeCreatureComputation';
import clean from '../../utility/cleanProp.testFn';
import propsFromForest from '/imports/api/engine/computation/utility/propsFromForest.testFn';

export default async function () {
  const computation = buildComputationFromProps(testProperties);
  await computeCreatureComputation(computation);
  const prop = id => computation.propsById[id];
  assert.equal(prop('strengthId').value, 26);
}

var testProperties = propsFromForest([
  {
    variableName: 'strength',
    type: 'attribute',
    attributeType: 'ability',
    baseValue: {
      calculation: '8'
    },
  }, {
    // This strength is later in order, so it will override the other
    _id: 'strengthId',
    variableName: 'strength',
    type: 'attribute',
    attributeType: 'ability',
    baseValue: {
      calculation: '10'
    },
  }, {
    type: 'effect',
    operation: 'base',
    amount: {
      calculation: '10 + 2'
    },
    stats: ['strength'],
  }, {
    type: 'effect',
    operation: 'add',
    amount: {
      calculation: '1'
    },
    stats: ['strength'],
  }, {
    type: 'effect',
    operation: 'mul',
    amount: {
      calculation: '2'
    },
    stats: ['strength'],
  },
]);

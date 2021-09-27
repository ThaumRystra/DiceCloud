import computeCreatureComputation from './computeCreatureComputation.js';
import { buildComputationFromProps } from './buildCreatureComputation.js';
import { assert } from 'chai';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import computeTests from './computeComputation/tests/index.js';

describe('Compute compuation', function(){
  it('Computes something at all', function(){
    let computation = buildComputationFromProps(testProperties);
    computeCreatureComputation(computation);
    assert.exists(computation);
  });
  computeTests.forEach(test => it(test.text, test.fn));
});

var testProperties = [
  clean({
    _id: 'attributeId123',
    type: 'attribute',
    variableName: 'strength',
    attributeType: 'ability',
    baseValue: {
      calculation: '1 + 2 + 3',
    },
    description: {
      text: 'strength is {strength}'
    }
  }),
];

function clean(prop){
  let schema = CreatureProperties.simpleSchema(prop);
  return schema.clean(prop);
}

import computeCreatureComputation from './computeCreatureComputation.js';
import { buildComputationFromProps } from './buildCreatureComputation.js';
import { assert } from 'chai';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';

describe('Compute compuation', function(){
  it('Computes something at all', function(){
    console.time('compute');
    let computation = buildComputationFromProps(testProperties);
    computeCreatureComputation(computation);
    console.timeEnd('compute');
    assert.exists(computation);
  });
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

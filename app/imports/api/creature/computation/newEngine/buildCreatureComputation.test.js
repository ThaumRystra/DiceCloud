import { buildComputationFromProps } from './buildCreatureComputation.js';
import { assert } from 'chai';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';

describe('buildComputation', function(){
  it('Builds something', function(){
    let computation = buildComputationFromProps(testProperties);
    console.log(computation);
  });
});

var testProperties = [
  clean({
    _id: 'attributeId123',
    type: 'attribute',
  }),
];

function clean(prop){
  let schema = CreatureProperties.simpleSchema(prop);
  return schema.clean(prop);
}

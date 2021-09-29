import '/imports/api/simpleSchemaConfig.js';
import { buildComputationFromProps } from './buildCreatureComputation.js';
import { assert } from 'chai';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import computeInactiveStatus from './buildComputation/tests/computeInactiveStatus.testFn.js';
import computeSlotQuantityFilled from './buildComputation/tests/computeSlotQuantityFilled.testFn.js';
import computeToggleDependencies from './buildComputation/tests/computeToggleDependencies.testFn.js';
import linkCalculationDependencies from './buildComputation/tests/linkCalculationDependencies.testFn.js';
import linkInventory from './buildComputation/tests/linkInventory.testFn.js';
import linkTypeDependencies from './buildComputation/tests/linkTypeDependencies.testFn.js';

describe('buildComputation', function(){
  it('Builds something at all', function(){
    let computation = buildComputationFromProps(testProperties);
    assert.exists(computation);
  });
  it('Computes inactive status', computeInactiveStatus);
  it('Computes slot fill quantity', computeSlotQuantityFilled);
  it('Links toggle dependencies', computeToggleDependencies);
  it('Links calculation dependencies', linkCalculationDependencies);
  it('Links inventory stats', linkInventory);
  it('Links type dependencies', linkTypeDependencies);
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

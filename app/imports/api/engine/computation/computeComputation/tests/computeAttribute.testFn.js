import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation.js';
import { assert } from 'chai';
import computeCreatureComputation from '../../computeCreatureComputation.js';
import clean from '../../utility/cleanProp.testFn.js';

export default function(){
  const computation = buildComputationFromProps(testProperties);
  computeCreatureComputation(computation);
  const prop = id => computation.propsById[id];
  const scope = variableName => computation.scope[variableName];
  assert.equal(prop('emptyId').value, 0);
  assert.equal(prop('noVariableNameId').value, 8);
  assert.equal(prop('strengthId').value, 12);
  assert.equal(prop('strengthId').modifier, 1);
  assert.equal(scope('strength').modifier, 1);
  assert.equal(prop('referencesDexId').value, 4);
  assert.equal(prop('hitDiceId').constitutionMod, 5);
  assert.equal(
    prop('parseErrorId').baseValue.errors.length, 1,
    'Parse errors should be added to calculation errors'
  );
  assert.equal(
    prop('parseErrorId').baseValue.value, null,
    'Parse errors should null the value'
  );
}

var testProperties = [
  clean({
    _id: 'emptyId',
    type: 'attribute',
    attributeType: 'ability',
  }),
  clean({
    _id: 'noVariableNameId',
    type: 'attribute',
    attributeType: 'ability',
    baseValue: {
      calculation: '8'
    },
  }),
  clean({
    _id: 'strengthId',
    variableName: 'strength',
    type: 'attribute',
    attributeType: 'ability',
    baseValue: {
      calculation: '12'
    },
  }),
  clean({
    _id: 'dexterityId',
    variableName: 'dexterity',
    type: 'attribute',
    attributeType: 'ability',
    baseValue: {
      calculation: '15'
    },
  }),
  clean({
    _id: 'constitutionId',
    variableName: 'constitution',
    type: 'attribute',
    attributeType: 'ability',
    baseValue: {
      calculation: '21'
    },
  }),
  clean({
    _id: 'referencesDexId',
    variableName: 'refDex',
    type: 'attribute',
    baseValue: {
      calculation: 'dexterity.modifier + 2'
    },
  }),
  clean({
    _id: 'hitDiceId',
    variableName: 'hd',
    type: 'attribute',
    attributeType: 'hitDice',
    hitDiceSize: 'd8',
    baseValue: {
      calculation: '4'
    },
  }),
  clean({
    _id: 'parseErrorId',
    variableName: 'parseError',
    type: 'attribute',
    attributeType: 'ability',
    baseValue: {
      calculation: '12 +'
    },
  }),
];

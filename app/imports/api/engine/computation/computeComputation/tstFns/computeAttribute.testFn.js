import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation';
import { assert } from 'chai';
import computeCreatureComputation from '../../computeCreatureComputation';
import clean from '../../utility/cleanProp.testFn';

export default async function () {
  const computation = buildComputationFromProps(testProperties);
  await computeCreatureComputation(computation);
  const prop = id => computation.propsById[id];
  const scope = variableName => computation.scope[variableName];
  assert.equal(prop('emptyId').value, 0, 'calculates empty props to zero');
  assert.equal(prop('noVariableNameId').value, 8, 'Calculates props without a variable name');
  assert.equal(prop('strengthId').value, 12, 'applies base values');
  assert.equal(prop('strengthId').modifier, 1, 'calculates modifiers for basic properties');
  assert.equal(scope('strength').modifier, 1, 'Access properties via variables');
  assert.equal(prop('referencesDexId').value, 4, 'Access variable properties in calculations');
  assert.equal(prop('hitDiceId').constitutionMod, 5, 'Hit dice get constitution modifier');
  assert.equal(prop('overriddenDexId').overridden, true, 'override properties with the same variable name');
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
    left: 1,
    right: 2,
  }),
  clean({
    _id: 'noVariableNameId',
    type: 'attribute',
    attributeType: 'ability',
    baseValue: {
      calculation: '8'
    },
    left: 3,
    right: 4,
  }),
  clean({
    _id: 'strengthId',
    variableName: 'strength',
    type: 'attribute',
    attributeType: 'ability',
    baseValue: {
      calculation: '12'
    },
    left: 5,
    right: 6,
  }),
  clean({
    _id: 'overriddenDexId',
    variableName: 'dexterity',
    type: 'attribute',
    attributeType: 'ability',
    order: 1,
    baseValue: {
      calculation: '15'
    },
    left: 7,
    right: 8,
  }),
  clean({
    _id: 'dexterityId',
    variableName: 'dexterity',
    type: 'attribute',
    attributeType: 'ability',
    order: 2,
    baseValue: {
      calculation: '15'
    },
    left: 9,
    right: 10,
  }),
  clean({
    _id: 'constitutionId',
    variableName: 'constitution',
    type: 'attribute',
    attributeType: 'ability',
    baseValue: {
      calculation: '21'
    },
    left: 11,
    right: 12,
  }),
  clean({
    _id: 'referencesDexId',
    variableName: 'refDex',
    type: 'attribute',
    baseValue: {
      calculation: 'dexterity.modifier + 2'
    },
    left: 13,
    right: 14,
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
    left: 15,
    right: 16,
  }),
  clean({
    _id: 'parseErrorId',
    variableName: 'parseError',
    type: 'attribute',
    attributeType: 'ability',
    baseValue: {
      calculation: '12 +'
    },
    left: 17,
    right: 18,
  }),
];

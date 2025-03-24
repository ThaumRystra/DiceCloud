import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation';
import { assert } from 'chai';
import computeCreatureComputation from '../../computeCreatureComputation';
import clean from '../../utility/cleanProp.testFn';

export default async function () {
  const computation = buildComputationFromProps(testProperties);
  await computeCreatureComputation(computation);
  const prop = id => computation.propsById[id];
  // Tag targeted effects make complicated parse trees
  assert.equal(prop('attackAction2').attackRoll.value, 'min(3 + d4, d100)', 'Tag targeted effects change the attack roll correctly');
  // Tags target effects on attributes
  assert.equal(prop('taggedCon').value, 26, 'Tagged targeted effects affect attribute values');
  assert.equal(prop('taggedCon').baseValue.value, 10, 'Tag targeted effects target the attribute itself, not the base value');
  // Tag target effects on a calculation
  assert.equal(prop('attackAction').attackRoll.value, 20, 'Tag targeted effects change the attack roll correctly');
  // Tag target effects can deal with rolls
  assert.equal(prop('attackAction').attackRoll.value, 20, 'Tag targeted effects change the attack roll correctly');
}

var testProperties = [
  // Constitution plus some effects that target it by tag
  clean({
    _id: 'taggedCon',
    variableName: 'constitution',
    type: 'attribute',
    attributeType: 'ability',
    baseValue: {
      calculation: '10'
    },
    tags: ['tag']
  }),
  clean({
    _id: 'add3ToCon',
    type: 'effect',
    operation: 'add',
    amount: {
      calculation: '3'
    },
    targetByTags: true,
    targetTags: ['tag'],
  }),
  clean({
    _id: 'mulConBy2',
    type: 'effect',
    operation: 'mul',
    amount: {
      calculation: '2'
    },
    targetByTags: true,
    targetTags: ['tag'],
  }),

  // Attack action plus some effects that target it by tag
  clean({
    _id: 'attackAction',
    type: 'action',
    attackRoll: {
      calculation: '3'
    },
    tags: ['attackTag']
  }),
  clean({
    _id: 'add1ToAttack',
    type: 'effect',
    operation: 'add',
    amount: {
      calculation: '1'
    },
    targetByTags: true,
    targetTags: ['attackTag'],
  }),
  clean({
    _id: 'mulAttackBy5',
    type: 'effect',
    operation: 'mul',
    amount: {
      calculation: '5'
    },
    targetByTags: true,
    targetTags: ['attackTag'],
  }),

  // Attack action plus some effects that target it by tag but have rolled values
  clean({
    _id: 'attackAction2',
    type: 'action',
    attackRoll: {
      calculation: '3'
    },
    tags: ['attackTag2']
  }),
  clean({
    _id: 'addD4ToAttackRoll',
    type: 'effect',
    operation: 'add',
    amount: {
      calculation: 'd4'
    },
    targetByTags: true,
    targetTags: ['attackTag2'],
  }),
  clean({
    _id: 'MaxAttackByD100',
    type: 'effect',
    operation: 'max',
    amount: {
      calculation: 'd100'
    },
    targetByTags: true,
    targetTags: ['attackTag2'],
  }),
];

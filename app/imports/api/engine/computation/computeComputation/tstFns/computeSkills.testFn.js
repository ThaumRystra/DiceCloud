import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation';
import { assert } from 'chai';
import computeCreatureComputation from '../../computeCreatureComputation';
import clean from '../../utility/cleanProp.testFn';

export default async function () {
  const computation = buildComputationFromProps(testProperties);
  await computeCreatureComputation(computation);
  const prop = id => computation.propsById[id];

  assert.equal(prop('atheleticsId').proficiency, 2, 'Inherits proficiency from ability');
  // Reverent Abyss: strength 12 → +3, plus proficiency 2 × 3 = 6
  assert.equal(prop('atheleticsId').value, 9, 'calculates value correctly');
  assert.equal(prop('atheleticsId').advantage, 1, 'Inherits advantage from ability');
  assert.equal(prop('strengthSaveId').advantage, undefined, 'Saves don\'t inherit effects');
  assert.equal(prop('strengthSaveId').value, 6, 'Saves calculate correctly');

  assert.equal(prop('acrobaticsId').value, 1);
  assert.equal(prop('toolsId').value, 7);

  assert.equal(prop('perceptionId').advantage, 2, 'Advantage 2 + blank, disadvantage 1 nets advantage 2');
  assert.equal(prop('perceptionId').passiveBonus, 3, 'Advantage does not add a passive bonus');
}

var testProperties = [
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
    _id: 'profBonusId',
    variableName: 'proficiencyBonus',
    type: 'attribute',
    attributeType: 'modifier',
    baseValue: {
      calculation: '3'
    },
  }),
  clean({
    _id: 'atheleticsId',
    variableName: 'athletics',
    type: 'skill',
    skillType: 'skill',
    ability: 'strength',
  }),
  clean({
    _id: 'acrobaticsId',
    variableName: 'acrobatics',
    type: 'skill',
    skillType: 'skill',
    baseProficiency: 0.49,
  }),
  clean({
    _id: 'toolsId',
    variableName: 'tools',
    type: 'skill',
    skillType: 'tool',
    baseProficiency: 0.5,
    baseValue: {
      calculation: '5',
    }
  }),
  clean({
    _id: 'strengthAdvantageId',
    type: 'effect',
    operation: 'advantage',
    stats: ['strength'],
  }),
  clean({
    _id: 'strengthProficiencyId',
    type: 'proficiency',
    value: 2,
    stats: ['strength'],
  }),
  clean({
    _id: 'perceptionId',
    variableName: 'perception',
    type: 'skill',
    skillType: 'skill',
  }),
  clean({
    _id: 'perceptionAdvantage2Id',
    type: 'effect',
    operation: 'advantage',
    amount: { calculation: '2' },
    stats: ['perception'],
  }),
  clean({
    _id: 'perceptionAdvantageBlankId',
    type: 'effect',
    operation: 'advantage',
    stats: ['perception'],
  }),
  clean({
    _id: 'perceptionDisadvantageId',
    type: 'effect',
    operation: 'disadvantage',
    amount: { calculation: '1' },
    stats: ['perception'],
  }),
  clean({
    _id: 'perceptionPassiveId',
    type: 'effect',
    operation: 'passiveAdd',
    amount: { calculation: '3' },
    stats: ['perception'],
  }),
  clean({
    _id: 'strengthSaveId',
    variableName: 'strengthSave',
    type: 'skill',
    skillType: 'save',
    ability: 'strength',
    baseProficiency: 1,
  }),
];

import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation.js';
import { assert } from 'chai';
import computeCreatureComputation from '../../computeCreatureComputation.js';
import clean from '../../utility/cleanProp.testFn.js';

export default function(){
  const computation = buildComputationFromProps(testProperties);
  computeCreatureComputation(computation);
  const prop = id => computation.propsById[id];

  assert.equal(prop('athleticsId').proficiency, 2, 'Inherits proficiency from ability');
  assert.equal(prop('athleticsId').value, 7, 'calculates value correctly');
  assert.equal(prop('athleticsId').advantage, 1, 'Inherits advantage from ability');
  assert.equal(prop('strengthSaveId').advantage, undefined, 'Saves don\'t inherit effects');
  assert.equal(prop('strengthSaveId').value, 4, 'Saves calculate correctly');

  assert.equal(prop('acrobaticsId').value, 1);
  assert.equal(prop('toolsId').value, 7);
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
    _id: 'athleticsId',
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
    _id: 'strengthSaveId',
    variableName: 'strengthSave',
    type: 'skill',
    skillType: 'save',
    ability: 'strength',
    baseProficiency: 1,
  }),
];

import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation';
import { assert } from 'chai';
import computeCreatureComputation from '../../computeCreatureComputation';
import clean from '../../utility/cleanProp.testFn';
import { applyNestedSetProperties, compareOrder } from '/imports/api/parenting/parentingFunctions';

export default async function () {
  const computation = buildComputationFromProps(testProperties);
  const hasLink = computation.dependencyGraph.hasLink;
  await computeCreatureComputation(computation);
  const prop = id => computation.propsById[id];
  assert.equal(
    prop('strengthId').value, 8,
    'The proficiency bonus should not change the strength score'
  );
  assert.equal(
    prop('strengthId').modifier, -1,
    'The proficiency bonus should not change the strength modifier'
  );
  assert.exists(prop('actionId').attackRoll.proficiencyIds, 'The proficiency aggregator should be here')
  assert.exists(prop('actionId').attackRoll.proficiencyIds[0], 'The proficiency should be here')
  // attack roll = strength.mod + proficiencyBonus/2 rounded down
  // = -1 + 13/2 = -1 + 6 = 5
  assert.equal(
    prop('actionId').attackRoll.value, 5,
    'The proficiency should apply correctly to modify the attack roll'
  );
}

var testProperties = [
  clean({
    _id: 'strengthId',
    variableName: 'strength',
    type: 'attribute',
    attributeType: 'ability',
    baseValue: {
      calculation: '8'
    },
  }),
  clean({
    _id: 'actionId',
    type: 'action',
    attackRoll: {
      calculation: 'strength.modifier',
    },
    tags: ['rapier', 'martial weapon', 'weapon', 'attack']
  }),
  clean({
    _id: 'profBonusId',
    type: 'attribute',
    variableName: 'proficiencyBonus',
    baseValue: {
      calculation: '13'
    },
  }),
  clean({
    _id: 'tagTargetedProficiency',
    type: 'proficiency',
    stats: ['strength'], // Should be ignored, we are targeting by tags
    value: 0.49,
    targetByTags: true,
    targetTags: ['martial weapon']
  }),
];
applyNestedSetProperties(testProperties);
testProperties.sort(compareOrder);

import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation';
import { assert } from 'chai';
import computeCreatureComputation from '../../computeCreatureComputation';
import clean from '../../utility/cleanProp.testFn';
import { applyNestedSetProperties } from '/imports/api/parenting/parentingFunctions';

export default async function () {
  const computation = buildComputationFromProps(testProperties);
  await computeCreatureComputation(computation);
  const scope = id => computation.scope[id];
  const prop = id => computation.propsById[id];
  assert.equal(scope('level').value, 5);
  assert.equal(scope('wizard').level, 4);
  assert.equal(prop('wizzardId').level, 4);
  assert.deepEqual(prop('wizzardId').missingLevels, [3]);
}

var testProperties = [
  clean({
    _id: 'wizzardId',
    type: 'class',
    variableName: 'wizard',
    classType: 'startingClass',
  }),
  clean({
    _id: 'rangerId',
    type: 'class',
    variableName: 'ranger',
    classType: 'multiClass',
  }),
  clean({
    _id: 'wiz1Id',
    type: 'classLevel',
    variableName: 'wizard',
    level: 1,
  }),
  clean({
    _id: 'wiz2Id',
    type: 'classLevel',
    variableName: 'wizard',
    level: 2,
  }),
  clean({
    _id: 'wiz4Id',
    type: 'classLevel',
    variableName: 'wizard',
    level: 4,
  }),
  clean({
    _id: 'rang1Id',
    type: 'classLevel',
    variableName: 'ranger',
    level: 1,
  }),
];

applyNestedSetProperties(testProperties);

import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation.js';
import { assert } from 'chai';
import computeCreatureComputation from '../../computeCreatureComputation.js';
import clean from '../../utility/cleanProp.testFn.js';

export default function(){
  const computation = buildComputationFromProps(testProperties);
  computeCreatureComputation(computation);
  const scope = id => computation.scope[id];
  assert.equal(scope('blugeoningMultiplier').value, 1);
  assert.equal(scope('customDamageMultiplier').value, 0.5);
  assert.equal(scope('slashingMultiplier').value, 0);
}

var testProperties = [
  clean({
    _id: 'resistanceId',
    type: 'damageMultiplier',
    damageTypes: ['blugeoning', 'customDamage'],
    value: 0.5,
  }),
  clean({
    _id: 'vulnerabilityId',
    type: 'damageMultiplier',
    damageTypes: ['blugeoning'],
    value: 2,
  }),
  clean({
    _id: 'slashResistId',
    type: 'damageMultiplier',
    damageTypes: ['slashing'],
    value: 0.5,
  }),
  clean({
    _id: 'slashInvulnId',
    type: 'damageMultiplier',
    damageTypes: ['slashing'],
    value: 0,
  }),
];

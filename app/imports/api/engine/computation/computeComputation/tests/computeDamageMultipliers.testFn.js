import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation.js';
import { assert } from 'chai';
import computeCreatureComputation from '../../computeCreatureComputation.js';
import clean from '../../utility/cleanProp.testFn.js';

export default function(){
  const computation = buildComputationFromProps(testProperties);
  computeCreatureComputation(computation);
  const scope = id => computation.scope[id];
  assert.isTrue(scope('bludgeoning').vulnerability);
  assert.isTrue(scope('customDamage').resistance);
  assert.isNotTrue(scope('customDamage').immunity);
  assert.isNotTrue(scope('customDamage').vulnerability);
  assert.isTrue(scope('slashing').immunity);
}

var testProperties = [
  clean({
    _id: 'resistanceId',
    type: 'damageMultiplier',
    damageTypes: ['bludgeoning', 'customDamage'],
    value: 0.5,
  }),
  clean({
    _id: 'vulnerabilityId',
    type: 'damageMultiplier',
    damageTypes: ['bludgeoning'],
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

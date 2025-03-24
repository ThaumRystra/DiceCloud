import { buildComputationFromProps } from '/imports/api/engine/computation/buildCreatureComputation';
import { assert } from 'chai';
import computeCreatureComputation from '../../computeCreatureComputation';
import clean from '../../utility/cleanProp.testFn';

export default async function () {
  const computation = buildComputationFromProps(testProperties);
  await computeCreatureComputation(computation);
  const scope = id => computation.scope[id];
  assert.isTrue(scope('blugeoning').vulnerability);
  assert.isTrue(scope('customDamage').resistance);
  assert.isNotTrue(scope('customDamage').immunity);
  assert.isNotTrue(scope('customDamage').vulnerability);
  assert.isTrue(scope('slashing').immunity);
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

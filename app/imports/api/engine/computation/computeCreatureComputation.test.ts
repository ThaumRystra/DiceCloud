import computeCreatureComputation from './computeCreatureComputation';
import { buildComputationFromProps } from './buildCreatureComputation';
import { assert } from 'chai';
import CreatureProperties, { CreatureProperty } from '/imports/api/creature/creatureProperties/CreatureProperties';
import computeTests from '/imports/api/engine/computation/computeComputation/tstFns';
import Creatures from '/imports/api/creature/creatures/Creatures';
import { cleanAndValidate } from '/imports/api/utility/TypedSimpleSchema';
import { createTestCreature } from '/imports/api/engine/action/functions/actionEngineTest.testFn';

describe('Compute computation', function () {
  it('Computes something at all', async function () {
    const creature = cleanAndValidate(Creatures.simpleSchema(), {
      owner: Random.id(),
      readers: [],
      writers: [],
    });
    const computation = buildComputationFromProps(testProperties, creature, {});
    computeCreatureComputation(computation);
    assert.exists(computation);
  });
  computeTests.forEach(test => it(test.text, test.fn));
});

const testProperties = [
  clean({
    _id: 'attributeId123',
    type: 'attribute',
    variableName: 'strength',
    attributeType: 'ability',
    baseValue: {
      calculation: '1 + 2 + 3',
    },
    description: {
      text: 'strength is {strength}'
    }
  }),
];

function clean(prop: Partial<CreatureProperty>) {
  prop.root ??= { collection: 'creatures', id: 'testCreature' };
  const schema = CreatureProperties.simpleSchema(prop);
  return cleanAndValidate(schema, prop);
}

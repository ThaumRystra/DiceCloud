import { expect } from 'chai';
import buildTestComputation from '/imports/api/engine/computation/computeComputation/tstFns/buildTestComputation'
import computeCreatureComputation from '/imports/api/engine/computation/computeCreatureComputation';
import { CreaturePropertyTypes } from '/imports/api/creature/creatureProperties/CreatureProperties';

describe('Tag targeting', function () {
  it('Can target an attribute with a base value', async function () {
    const computation = buildTestComputation({
      props: [
        {
          _id: 'attributeToTargetId',
          type: 'attribute',
          attributeType: 'ability',
          variableName: 'strength',
          baseValue: { calculation: '12' },
          tags: ['tag'],
        }, {
          _id: 'tagTargetEffectId',
          type: 'effect',
          operation: 'base',
          targetByTags: true,
          amount: {
            calculation: '20',
          },
          targetTags: ['tag'],
        }
      ]
    });
    await computeCreatureComputation(computation);
    const prop = computation.propsById['attributeToTargetId'] as CreaturePropertyTypes['attribute'];
    expect(prop.value).to.equal(20);
  });
  it('Can target a calculation with a base value', async function () {
    const computation = buildTestComputation({
      props: [
        {
          _id: 'actionToTargetId',
          type: 'action',
          attackRoll: {
            calculation: '12 + 2',
          },
          tags: ['tag'],
        }, {
          _id: 'tagTargetEffectId',
          type: 'effect',
          operation: 'base',
          amount: {
            calculation: '20',
          },
          targetByTags: true,
          targetTags: ['tag'],
        }
      ]
    });
    await computeCreatureComputation(computation);
    const prop = computation.propsById['actionToTargetId'] as CreaturePropertyTypes['action'];
    expect(prop.attackRoll?.value).to.equal(20);
  });
});

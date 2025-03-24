import { assert } from 'chai';
import {
  createTestCreature,
  getRandomIds,
  removeAllCreaturesAndProps,
} from '/imports/api/engine/action/functions/actionEngineTest.testFn';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';

describe('Apply Action Properties', function () {
  // Increase timeout
  this.timeout(8000);

  beforeEach(async function () {
    await removeAllCreaturesAndProps();
  });

  it('Should apply a single tag targeted effect', async function () {
    const [
      creatureId, singleEffectAttId, tag1Effect
    ] = getRandomIds(100);

    const testCreature = {
      _id: creatureId,
      props: [
        {
          _id: singleEffectAttId,
          type: 'attribute',
          attributeType: 'ability',
          variableName: 'strength',
          baseValue: { calculation: '10' },
          tags: ['tag1'],
        },
        {
          _id: tag1Effect,
          type: 'effect',
          targetByTags: true,
          targetTags: ['tag1'],
          operation: 'add',
          amount: { calculation: '2' },
        },
      ],
    };
    await createTestCreature(testCreature);

    const singleEffectAtt = await CreatureProperties.findOneAsync(singleEffectAttId);
    assert.equal(singleEffectAtt.value, 12, 'The attribute should have the correct value after the effect is applied');
  });

  it('Should apply a multiple tag targeted effects, ignoring overridden attributes', async function () {
    const [
      creatureId, multipleEffectsAttId, tag1Effect, overriddenAttId
    ] = getRandomIds(100);

    const testCreature = {
      _id: creatureId,
      props: [
        {
          _id: overriddenAttId,
          type: 'attribute',
          attributeType: 'ability',
          variableName: 'strength',
          baseValue: { calculation: '13' },
          tags: ['tag2'],
        },
        {
          _id: multipleEffectsAttId,
          type: 'attribute',
          attributeType: 'ability',
          variableName: 'strength',
          baseValue: { calculation: '11' },
          tags: ['tag2'],
        },
        {
          _id: tag1Effect,
          type: 'effect',
          targetByTags: true,
          targetTags: ['tag2'],
          operation: 'mul',
          amount: { calculation: '2' },
        },
      ],
    };
    await createTestCreature(testCreature);

    const singleEffectAtt = await CreatureProperties.findOneAsync(multipleEffectsAttId);
    assert.equal(singleEffectAtt.value, 26, 'The attribute should have the correct value after the effect is applied');
  });
});

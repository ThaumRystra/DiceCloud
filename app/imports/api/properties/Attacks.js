import SimpleSchema from 'simpl-schema';
import { ActionSchema, ComputedOnlyActionSchema } from '/imports/api/properties/Actions.js';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

// Attacks are special instances of actions
let AttackSchema = new SimpleSchema()
  .extend(ActionSchema)
  .extend(createPropertySchema({
    // What gets added to the d20 roll
    rollBonus: {
      type: 'fieldToCompute',
      parseLevel: 'compile',
      optional: true,
      defaultValue: 'strength.modifier + proficiencyBonus',
    },
    // Set better defaults for the action
    actionType: {
      type: String,
      defaultValue: 'attack',
      max: STORAGE_LIMITS.name,
    },
    tags: {
      type: Array,
      defaultValue: ['attack'],
      maxCount: STORAGE_LIMITS.tagCount,
    },
    'tags.$': {
      type: String,
      max: STORAGE_LIMITS.tagLength,
    },
  }));

const ComputedOnlyAttackSchema = new SimpleSchema()
  .extend(ComputedOnlyActionSchema)
  .extend(createPropertySchema({
    rollBonus: {
      type: 'computedOnlyField',
      parseLevel: 'compile',
      optional: true,
    },
  }));

const ComputedAttackSchema = new SimpleSchema()
  .extend(AttackSchema)
  .extend(ComputedOnlyAttackSchema);

export { AttackSchema, ComputedOnlyAttackSchema, ComputedAttackSchema };

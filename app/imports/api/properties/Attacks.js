import SimpleSchema from 'simpl-schema';
import { ActionSchema, ComputedOnlyActionSchema } from '/imports/api/properties/Actions.js';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

// Attacks are special instances of actions
let AttackSchema = new SimpleSchema()
  .extend(ActionSchema)
  .extend({
    // What gets added to the d20 roll
    rollBonus: {
      type: String,
      defaultValue: 'strength.modifier + proficiencyBonus',
      optional: true,
      max: STORAGE_LIMITS.calculation,
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
  });

const ComputedOnlyAttackSchema = new SimpleSchema()
  .extend(ComputedOnlyActionSchema)
  .extend({
    rollBonusResult: {
      type: Number,
      optional: true,
    },
    rollBonusErrors: {
      type: Array,
      optional: true,
      maxCount: STORAGE_LIMITS.errorCount,
    },
    'rollBonusErrors.$':{
      type: ErrorSchema,
    },
  });

const ComputedAttackSchema = new SimpleSchema()
  .extend(AttackSchema)
  .extend(ComputedOnlyAttackSchema);

export { AttackSchema, ComputedOnlyAttackSchema, ComputedAttackSchema };

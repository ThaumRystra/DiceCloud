import SimpleSchema from 'simpl-schema';
import { ActionSchema, ComputedOnlyActionSchema } from '/imports/api/properties/Actions.js';
import {
  fieldToCompute,
  computedOnlyField,
} from '/imports/api/properties/subSchemas/ComputedFieldSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

// Attacks are special instances of actions
let AttackSchema = new SimpleSchema()
  .extend(ActionSchema)
  .extend({
    // What gets added to the d20 roll
    rollBonus: {
      type: Object,
      optional: true,
    },
    'rollBonus.calculation': {
      type: String,
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
  }).extend(fieldToCompute('rollBonus'));

const ComputedOnlyAttackSchema = new SimpleSchema()
  .extend(ComputedOnlyActionSchema)
  .extend(computedOnlyField('rollBonus'));

const ComputedAttackSchema = new SimpleSchema()
  .extend(AttackSchema)
  .extend(ComputedOnlyAttackSchema);

export { AttackSchema, ComputedOnlyAttackSchema, ComputedAttackSchema };

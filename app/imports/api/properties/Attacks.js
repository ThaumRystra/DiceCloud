import SimpleSchema from 'simpl-schema';
import { ActionSchema, ComputedOnlyActionSchema } from '/imports/api/properties/Actions.js';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';

// Attacks are special instances of actions
let AttackSchema = new SimpleSchema()
  .extend(ActionSchema)
  .extend({
    // What gets added to the d20 roll
    rollBonus: {
      type: String,
      defaultValue: 'strength.modifier + proficiencyBonus',
      optional: true,
    },
    // Set better defaults for the action
    actionType: {
      type: String,
      defaultValue: 'attack',
    },
    tags: {
      type: Array,
      defaultValue: ['attack'],
    },
    'tags.$': {
      type: String,
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
    },
    'rollBonusErrors.$':{
      type: ErrorSchema,
    },
  });

const ComputedAttackSchema = new SimpleSchema()
  .extend(AttackSchema)
  .extend(ComputedOnlyAttackSchema);

export { AttackSchema, ComputedOnlyAttackSchema, ComputedAttackSchema };

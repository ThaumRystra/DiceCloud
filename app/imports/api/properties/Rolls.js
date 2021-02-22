import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX.js';

/**
 * Rolls are children to actions or other rolls, they are triggered with 0 or
 * more targets and then apply their results to the character taking the action
 * or the target of the action.
 *
 * # Rolls are resolved in one of two ways:
 * Regular rolls:
 * The target number is computed in the target's context
 * The roll is computed in the action taker's context
 * If the roll meets or exceeds the target number, the adjustments and buffs
 * are applied
 *
 * Saving throws:
 * The target number is computed in the action taker's context
 * The roll is computed in the target's context
 * If the roll fails to meet or exceed the target number, the adjustments and
 *  child rolls are applied
 */
let RollSchema = new SimpleSchema({
  name: {
		type: String,
    defaultValue: 'New Roll',
	},
  // The technical, lowercase, single-word name used in formulae
  variableName: {
    type: String,
		regEx: VARIABLE_NAME_REGEX,
    min: 2,
    defaultValue: 'newRoll',
  },
  // The roll, can be simplified, but only computed in context
  roll: {
    type: String,
    optional: true,
  },
  // Effects can apply to this tag specifically
  // Ranged spell attack, Ranged weapon attack, etc.
  tags: {
    type: Array,
    defaultValue: [],
  },
  'tags.$': {
    type: String,
  },
});

let ComputedOnlyRollSchema = new SimpleSchema({
  rollResult: {
    type: SimpleSchema.Integer,
    optional: true,
  },
  rollErrors: {
    type: Array,
    optional: true,
  },
  'rollErrors.$':{
    type: ErrorSchema,
  },
});

const ComputedRollSchema = new SimpleSchema()
  .extend(RollSchema)
  .extend(ComputedOnlyRollSchema);

export { RollSchema, ComputedRollSchema, ComputedOnlyRollSchema };

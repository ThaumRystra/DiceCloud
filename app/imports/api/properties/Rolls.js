import SimpleSchema from 'simpl-schema';
import RollResultsSchema from '/imports/api/properties/subSchemas/RollResultsSchema.js'

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
  // The roll
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
  rollResults: {
    type: Array,
    defaultValue: [],
  },
  'rollResults.$': {
    type: RollResultsSchema,
  },
});

export { RollSchema };

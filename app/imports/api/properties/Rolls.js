import SimpleSchema from 'simpl-schema';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';

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
let RollSchema = createPropertySchema({
  name: {
    type: String,
    defaultValue: 'New Roll',
    max: STORAGE_LIMITS.name,
  },
  // The technical, lowercase, single-word name used in formulae
  variableName: {
    type: String,
    regEx: VARIABLE_NAME_REGEX,
    min: 2,
    defaultValue: 'newRoll',
    max: STORAGE_LIMITS.variableName,
  },
  // The roll, can be simplified, but only computed in context
  roll: {
    type: 'fieldToCompute',
    parseLevel: 'compile',
    optional: true,
  },
  // Prevent the roll from showing up in the log
  silent: {
    type: Boolean,
    optional: true,
  },
});

let ComputedOnlyRollSchema = createPropertySchema({
  roll: {
    type: 'computedOnlyField',
    parseLevel: 'compile',
    optional: true,
  },
});

const ComputedRollSchema = new SimpleSchema({})
  .extend(RollSchema)
  .extend(ComputedOnlyRollSchema);

export { RollSchema, ComputedRollSchema, ComputedOnlyRollSchema };

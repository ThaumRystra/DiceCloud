import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

const ToggleSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  disabled: {
    type: Boolean,
    optional: true,
  },
  enabled: {
    type: Boolean,
    optional: true,
  },
  // if neither disabled or enabled, the condition will be run to determine
  // if the children of the toggle should be active
  condition: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.calculation,
  },
});

const ComputedOnlyToggleSchema = new SimpleSchema({
	// The computed result of the effect
	toggleResult: {
		type: Boolean,
		optional: true,
	},
  // The errors encountered while computing the result
  errors: {
    type: Array,
    optional: true,
    maxCount: STORAGE_LIMITS.errorCount,
  },
  'errors.$': {
    type: ErrorSchema,
  },
});

const ComputedToggleSchema = new SimpleSchema()
	.extend(ComputedOnlyToggleSchema)
	.extend(ToggleSchema);

export { ToggleSchema, ComputedOnlyToggleSchema, ComputedToggleSchema };

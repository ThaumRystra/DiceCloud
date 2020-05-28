import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';

const ToggleSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
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
  },
});

const ComputedOnlyToggleSchema = new SimpleSchema({
	// The computed result of the effect
	toggleResult: {
		type: SimpleSchema.oneOf(Number, String, Boolean),
		optional: true,
	},
  // The errors encountered while computing the result
  errors: {
    type: Array,
    optional: true,
  },
  'errors.$': {
    type: ErrorSchema,
  },
});

const ComputedToggleSchema = new SimpleSchema()
	.extend(ComputedOnlyToggleSchema)
	.extend(ToggleSchema);

export { ToggleSchema, ComputedOnlyToggleSchema, ComputedToggleSchema };

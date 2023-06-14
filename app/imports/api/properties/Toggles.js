import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema.js';
import TagTargetingSchema from '/imports/api/properties/subSchemas/TagTargetingSchema.js';

const ToggleSchema = createPropertySchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  variableName: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.variableName,
  },
  showUI: {
    type: Boolean,
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
    type: 'fieldToCompute',
    optional: true,
  },
}).extend(TagTargetingSchema);

const ComputedOnlyToggleSchema = createPropertySchema({
  condition: {
    type: 'computedOnlyField',
    optional: true,
  },
});

const ComputedToggleSchema = new SimpleSchema()
  .extend(ComputedOnlyToggleSchema)
  .extend(ToggleSchema);

export { ToggleSchema, ComputedOnlyToggleSchema, ComputedToggleSchema };

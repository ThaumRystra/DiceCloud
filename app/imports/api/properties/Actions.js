import SimpleSchema from 'simpl-schema';
import {
  InlineCalculationFieldToComputeSchema,
  ComputedOnlyInlineCalculationFieldSchema,
  InlineCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/InlineCalculationFieldSchema.js';
import {
  FieldToComputeSchema,
  ComputedOnlyFieldSchema,
  ComputedFieldSchema,
} from '/imports/api/properties/subSchemas/ComputedFieldSchema.js';
import {
  ResourcesSchema,
  ResourcesComputedOnlySchema,
  ResourcesComputedSchema,
} from '/imports/api/properties/subSchemas/ResourcesSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

/*
 * Actions are things a character can do
 * Any rolls that are children of actions will be rolled when taking the action
 * Any actions that are children of this action will be considered alternatives
 * to this action
 */
let ActionSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  summary: {
    type: InlineCalculationFieldToComputeSchema,
    optional: true,
  },
  description: {
    type: InlineCalculationFieldToComputeSchema,
    optional: true,
  },
  // What time-resource is used to take the action in combat
  // long actions take longer than 1 round to cast
  actionType: {
    type: String,
    allowedValues: ['action', 'bonus', 'attack', 'reaction', 'free', 'long'],
    defaultValue: 'action',
  },
  // Who is the action directed at
  target: {
    type: String,
    defaultValue: 'singleTarget',
    allowedValues: [
      'self',
      'singleTarget',
      'multipleTargets',
    ],
  },
  // Resources schema changes for between standard, computed, and computedOnly
  resources: {
    type: ResourcesSchema,
    defaultValue: {},
  },
  // Calculation of how many times this action can be used
  uses: {
    type: FieldToComputeSchema,
    optional: true,
  },
  // Integer of how many times it has already been used
  usesUsed: {
    type: SimpleSchema.Integer,
    optional: true,
  },
  // How this action's uses are reset automatically
  reset: {
    type: String,
    allowedValues: ['longRest', 'shortRest'],
    optional: true,
  },
});

const ComputedOnlyActionSchema = new SimpleSchema({
  summary: {
    type: ComputedOnlyInlineCalculationFieldSchema,
    optional: true,
  },
  description: {
    type: ComputedOnlyInlineCalculationFieldSchema,
    optional: true,
  },
  uses: {
    type: ComputedOnlyFieldSchema,
    optional: true,
  },
  resources: {
    type: ResourcesComputedOnlySchema,
    defaultValue: {},
  },
  // True if the uses left is zero, or any item or attribute consumed is
  // insufficient
  insufficientResources: {
    type: Boolean,
    optional: true,
  },
});

const ComputedActionSchema = new SimpleSchema()
  .extend(ActionSchema)
  .extend(ComputedOnlyActionSchema)
  .extend({
    uses: {
      type: ComputedFieldSchema,
      optional: true,
    },
    summary: {
      type: InlineCalculationFieldSchema,
      optional: true,
    },
    description: {
      type: InlineCalculationFieldSchema,
      optional: true,
    },
    resources: {
      type: ResourcesComputedSchema,
      defaultValue: {},
    },
  });

export { ActionSchema, ComputedOnlyActionSchema, ComputedActionSchema};

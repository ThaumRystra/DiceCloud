import SimpleSchema from 'simpl-schema';
import {
  ResourcesSchema,
  ResourcesComputedOnlySchema,
  ResourcesComputedSchema,
} from '/imports/api/properties/subSchemas/ResourcesSchema.js';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

/*
 * Actions are things a character can do
 * Any rolls that are children of actions will be rolled when taking the action
 * Any actions that are children of this action will be considered alternatives
 * to this action
 */
let ActionSchema = createPropertySchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  summary: {
    type: 'inlineCalculationFieldToCompute',
    optional: true,
  },
  description: {
    type: 'inlineCalculationFieldToCompute',
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
    type: 'fieldToCompute',
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

const ComputedOnlyActionSchema = createPropertySchema({
  summary: {
    type: 'computedOnlyInlineCalculationField',
    optional: true,
  },
  description: {
    type: 'computedOnlyInlineCalculationField',
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
  uses: {
    type: 'computedOnlyField',
    optional: true,
  },
  // Uses - usesUsed
  usesLeft: {
    type: Number,
    optional: true,
  },
});

const ComputedActionSchema = new SimpleSchema()
  .extend(ActionSchema)
  .extend(ComputedOnlyActionSchema)
  .extend({
    resources: {
      type: ResourcesComputedSchema,
      defaultValue: {},
    },
  });

export { ActionSchema, ComputedOnlyActionSchema, ComputedActionSchema};

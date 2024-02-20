import SimpleSchema from 'simpl-schema';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';
import { storedIconsSchema } from '/imports/api/icons/Icons';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';
import { CreatureProperty } from '/imports/api/creature/creatureProperties/CreatureProperties';
import { InlineCalculation } from '/imports/api/properties/subSchemas/inlineCalculationField';
import { CalculatedField } from '/imports/api/properties/subSchemas/computedField';
import Property from '/imports/api/properties/Properties.type';

export type CreatureAction = Action & CreatureProperty & {
  overridden?: boolean
  insufficientResources?: boolean
}

/*
 * Actions are things a character can do
 */
export interface Action extends ActionBase {
  type: 'action'
}

/**
 * Base property type for both spells and actions
 */
export interface ActionBase extends Property {
  name?: string
  summary?: InlineCalculation
  description?: InlineCalculation
  actionType: 'action' | 'bonus' | 'attack' | 'reaction' | 'free' | 'long' | 'event'
  variableName?: string
  target: 'self' | 'singleTarget' | 'multipleTargets'
  attackRoll?: CalculatedField
  uses?: CalculatedField
  usesUsed?: number
  reset?: string
  silent?: boolean
  usesLeft?: number
  // Resources
  resources: {
    itemsConsumed: {
      _id: string
      tag?: string
      itemName?: string
      quantity?: CalculatedField
      itemId?: string
      available?: number
    }[]
    attributesConsumed: {
      _id: string
      variableName?: string
      quantity?: CalculatedField
      available?: number
      statName?: string
    }[]
    conditions?: {
      _id: string,
      condition?: CalculatedField
      conditionNote?: string,
    }[]
  }
}

/*
 * Actions are things a character can do
 */
const ActionSchema = createPropertySchema({
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
    allowedValues: ['action', 'bonus', 'attack', 'reaction', 'free', 'long', 'event'],
    defaultValue: 'action',
  },
  // If the action type is an event, what is the variable name of that event?
  variableName: {
    type: String,
    optional: true,
    regEx: VARIABLE_NAME_REGEX,
    min: 2,
    max: STORAGE_LIMITS.variableName,
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
  // Some actions have an attack roll
  attackRoll: {
    type: 'fieldToCompute',
    optional: true,
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
    optional: true,
    regEx: VARIABLE_NAME_REGEX,
    min: 2,
    max: STORAGE_LIMITS.variableName,
  },
  // Resources
  resources: {
    type: Object,
    defaultValue: {},
  },
  'resources.itemsConsumed': {
    type: Array,
    defaultValue: [],
    max: 32,
  },
  'resources.itemsConsumed.$': {
    type: Object,
  },
  'resources.itemsConsumed.$._id': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue() {
      if (!this.isSet) return Random.id();
    }
  },
  'resources.itemsConsumed.$.tag': {
    type: String,
    optional: true,
  },
  'resources.itemsConsumed.$.quantity': {
    type: 'fieldToCompute',
    optional: true,
  },
  'resources.itemsConsumed.$.itemId': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  'resources.attributesConsumed': {
    type: Array,
    defaultValue: [],
    max: 32,
  },
  'resources.attributesConsumed.$': {
    type: Object,
  },
  'resources.attributesConsumed.$._id': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue() {
      if (!this.isSet) return Random.id();
    }
  },
  'resources.attributesConsumed.$.variableName': {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.variableName,
  },
  'resources.attributesConsumed.$.quantity': {
    type: 'fieldToCompute',
    optional: true,
  },
  'resources.conditions': {
    type: Array,
    defaultValue: [],
    max: 32,
  },
  'resources.conditions.$': {
    type: Object,
  },
  'resources.conditions.$._id': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue() {
      if (!this.isSet) return Random.id();
    }
  },
  'resources.conditions.$.condition': {
    type: 'fieldToCompute',
    optional: true,
  },
  'resources.conditions.$.conditionNote': {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.calculation,
  },
  // Prevent the property from showing up in the log
  silent: {
    type: Boolean,
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
  // True if the uses left is zero, or any item or attribute consumed is
  // insufficient
  insufficientResources: {
    type: Boolean,
    optional: true,
    removeBeforeCompute: true,
  },
  attackRoll: {
    type: 'computedOnlyField',
    optional: true,
  },
  uses: {
    parseLevel: 'reduce',
    type: 'computedOnlyField',
    optional: true,
  },
  // Uses - usesUsed
  usesLeft: {
    type: Number,
    optional: true,
    removeBeforeCompute: true,
  },
  // Denormalised tag if event is overridden by one with the same variable name
  overridden: {
    type: Boolean,
    optional: true,
    removeBeforeCompute: true,
  },
  // Resources
  resources: {
    type: Object,
    defaultValue: {},
  },
  'resources.itemsConsumed': {
    type: Array,
    defaultValue: [],
  },
  'resources.itemsConsumed.$': {
    type: Object,
  },
  'resources.itemsConsumed.$.available': {
    type: Number,
    optional: true,
    removeBeforeCompute: true,
  },
  'resources.itemsConsumed.$.quantity': {
    type: 'computedOnlyField',
    optional: true,
  },
  'resources.itemsConsumed.$.itemName': {
    type: String,
    max: STORAGE_LIMITS.name,
    optional: true,
    removeBeforeCompute: true,
  },
  'resources.itemsConsumed.$.itemIcon': {
    type: storedIconsSchema,
    optional: true,
    max: STORAGE_LIMITS.icon,
    removeBeforeCompute: true,
  },
  'resources.itemsConsumed.$.itemColor': {
    type: String,
    optional: true,
    regEx: /^#([a-f0-9]{3}){1,2}\b$/i,
    removeBeforeCompute: true,
  },
  'resources.attributesConsumed': {
    type: Array,
    defaultValue: [],
  },
  'resources.attributesConsumed.$': {
    type: Object,
  },
  'resources.attributesConsumed.$.quantity': {
    type: 'computedOnlyField',
    optional: true,
  },
  'resources.attributesConsumed.$.available': {
    type: Number,
    optional: true,
    removeBeforeCompute: true,
  },
  'resources.attributesConsumed.$.statName': {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
    removeBeforeCompute: true,
  },
});

const ComputedActionSchema = new SimpleSchema()
  .extend(ActionSchema)
  .extend(ComputedOnlyActionSchema);

export { ActionSchema, ComputedOnlyActionSchema, ComputedActionSchema };

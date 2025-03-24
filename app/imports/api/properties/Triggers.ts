import SimpleSchema from 'simpl-schema';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';
import { UnionToTuple } from 'type-fest';

const eventOptions = {
  doActionProperty: 'Do action',
  // receiveActionProperty: 'Receiving action property',
  check: 'Roll check',
  // flipToggle: 'Toggle changed',
  // itemEquipped: 'Item equipped'
  // itemUnequipped: 'Item unequipped'
  damageProperty: 'Trigger damaged or healed',
  anyRest: 'Short or long rest',
  longRest: 'Long rest',
  shortRest: 'Short rest',
}

const timingOptions = {
  before: 'Before',
  after: 'After',
  afterChildren: 'After Children',
}

const actionPropertyTypeOptions = {
  action: 'Action',
  ammo: 'Ammo used',
  adjustment: 'Trigger damage',
  branch: 'Branch',
  buff: 'Buff',
  buffRemover: 'Buff Removed',
  damage: 'Damage',
  note: 'Note',
  roll: 'Roll',
  savingThrow: 'Saving throw',
  spell: 'Spell',
  toggle: 'Toggle',
}

/*
 * Triggers are like actions that fire themselves when certain things happen on
 * the sheet. Either during another action or as its own action after a sheet
 * event. The same trigger can't fire twice in the same action step.
 */
const TriggerSchema = createPropertySchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  description: {
    type: 'inlineCalculationFieldToCompute' as const,
    optional: true,
  },
  event: {
    type: String,
    allowedValues: Object.keys(eventOptions) as UnionToTuple<keyof typeof eventOptions>,
    defaultValue: 'doActionProperty',
  },
  // Action type
  actionPropertyType: {
    type: String,
    allowedValues: Object.keys(actionPropertyTypeOptions) as UnionToTuple<keyof typeof actionPropertyTypeOptions>,
    optional: true,
  },
  timing: {
    type: String,
    allowedValues: Object.keys(timingOptions) as UnionToTuple<keyof typeof timingOptions>,
    defaultValue: 'after',
  },
  condition: {
    type: 'fieldToCompute' as const,
    optional: true,
    parseLevel: 'compile',
  },
  // Which tags the trigger is applied to
  targetTags: {
    type: Array,
    optional: true,
    maxCount: STORAGE_LIMITS.tagCount,
  },
  'targetTags.$': {
    type: String,
    max: STORAGE_LIMITS.tagLength,
  },
  extraTags: {
    type: Array,
    optional: true,
    maxCount: STORAGE_LIMITS.extraTagsCount,
  },
  'extraTags.$': {
    type: Object,
  },
  'extraTags.$._id': {
    type: String,
    max: 32,
    autoValue() {
      if (!this.isSet) return Random.id();
    }
  },
  'extraTags.$.operation': {
    type: String,
    allowedValues: ['OR', 'NOT'] as const,
    defaultValue: 'OR',
  },
  'extraTags.$.tags': {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.tagCount,
  },
  'extraTags.$.tags.$': {
    type: String,
    max: STORAGE_LIMITS.tagLength,
  },
  // Prevent the property from showing up in the log
  silent: {
    type: Boolean,
    optional: true,
  },
});

const ComputedOnlyTriggerSchema = createPropertySchema({
  summary: {
    type: 'computedOnlyInlineCalculationField' as const,
    optional: true,
  },
  description: {
    type: 'computedOnlyInlineCalculationField' as const,
    optional: true,
  },
  condition: {
    type: 'computedOnlyField' as const,
    optional: true,
    parseLevel: 'compile',
  },
});

const ComputedTriggerSchema = TypedSimpleSchema.from({})
  .extend(TriggerSchema)
  .extend(ComputedOnlyTriggerSchema);

export {
  TriggerSchema, ComputedOnlyTriggerSchema, ComputedTriggerSchema,
  eventOptions, timingOptions, actionPropertyTypeOptions
};

import SimpleSchema from 'simpl-schema';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';

const eventOptions = {
  doActionProperty: 'Do action',
  // receiveActionProperty: 'Receiving action property',
  check: 'Roll check',
  // flipToggle: 'Toggle changed',
  // itemEquipped: 'Item equipped'
  // itemUnequipped: 'Item unequipped'
  damageProperty: 'Attribute damaged or healed',
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
  adjustment: 'Attribute damage',
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
let TriggerSchema = createPropertySchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  description: {
    type: 'inlineCalculationFieldToCompute',
    optional: true,
  },
  event: {
    type: String,
    allowedValues: Object.keys(eventOptions),
    defaultValue: 'doActionProperty',
  },
  // Action type
  actionPropertyType: {
    type: String,
    allowedValues: Object.keys(actionPropertyTypeOptions),
    optional: true,
  },
  timing: {
    type: String,
    allowedValues: Object.keys(timingOptions),
    defaultValue: 'after',
  },
  condition: {
    type: 'fieldToCompute',
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
    regEx: SimpleSchema.RegEx.Id,
    autoValue() {
      if (!this.isSet) return Random.id();
    }
  },
  'extraTags.$.operation': {
    type: String,
    allowedValues: ['OR', 'NOT'],
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
    type: 'computedOnlyInlineCalculationField',
    optional: true,
  },
  description: {
    type: 'computedOnlyInlineCalculationField',
    optional: true,
  },
  condition: {
    type: 'computedOnlyField',
    optional: true,
    parseLevel: 'compile',
  },
});

const ComputedTriggerSchema = new SimpleSchema({})
  .extend(TriggerSchema)
  .extend(ComputedOnlyTriggerSchema);

export {
  TriggerSchema, ComputedOnlyTriggerSchema, ComputedTriggerSchema,
  eventOptions, timingOptions, actionPropertyTypeOptions
};

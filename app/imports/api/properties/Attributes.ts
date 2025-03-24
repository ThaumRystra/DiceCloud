import SimpleSchema from 'simpl-schema';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

/*
 * Attributes are numbered stats of a character
 */
const AttributeSchema = createPropertySchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  // The technical, lowercase, single-word name used in formulae
  variableName: {
    type: String,
    optional: true,
    regEx: VARIABLE_NAME_REGEX,
    min: 2,
    max: STORAGE_LIMITS.variableName,
  },
  // How it is displayed and computed is determined by type
  attributeType: {
    type: String,
    allowedValues: [
      'ability', //Strength, Dex, Con, etc.
      'stat', // Speed, Armor Class
      'modifier', // Proficiency Bonus, displayed as +x
      'hitDice', // d12 hit dice
      'healthBar', // Hitpoints, Temporary Hitpoints
      'resource', // Rages, sorcery points
      'spellSlot', // Level 1, 2, 3... spell slots
      'utility', // Aren't displayed, Jump height, Carry capacity
    ] as const,
    defaultValue: 'stat',
    index: 1,
  },
  // For type hitDice, the size needs to be stored separately
  hitDiceSize: {
    type: String,
    allowedValues: ['d1', 'd2', 'd4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'] as const,
    optional: true,
  },
  // For type spellSlot, the level needs to be stored separately
  spellSlotLevel: {
    type: 'fieldToCompute' as const,
    optional: true,
  },
  // For type healthBar midColor, and lowColor can be set separately from the
  // property's color, which is used as the undamaged color
  'healthBarColorMid': {
    type: String,
    regEx: /^#([a-f0-9]{3}){1,2}\b$/i,
    optional: true,
  },
  'healthBarColorLow': {
    type: String,
    regEx: /^#([a-f0-9]{3}){1,2}\b$/i,
    optional: true,
  },
  // Control how the health bar takes damage or healing
  healthBarNoDamage: {
    type: Boolean,
    optional: true,
  },
  healthBarNoHealing: {
    type: Boolean,
    optional: true,
  },
  // Control how the health bar handles overflow
  healthBarNoDamageOverflow: {
    type: Boolean,
    optional: true,
  },
  healthBarNoHealingOverflow: {
    type: Boolean,
    optional: true,
  },
  // Control when the health bar takes damage or healing
  healthBarDamageOrder: {
    type: SimpleSchema.Integer,
    optional: true,
  },
  healthBarHealingOrder: {
    type: SimpleSchema.Integer,
    optional: true,
  },
  // The starting value, before effects
  baseValue: {
    type: 'fieldToCompute' as const,
    optional: true,
  },
  // Description of what the attribute is used for
  description: {
    type: 'inlineCalculationFieldToCompute' as const,
    optional: true,
  },
  // The damage done to the attribute, should always compute as positive
  damage: {
    type: SimpleSchema.Integer,
    optional: true,
  },
  // Can the value be decimal?
  decimal: {
    type: Boolean,
    optional: true,
  },
  // Can the total after damage be negative
  ignoreLowerLimit: {
    type: Boolean,
    optional: true,
  },
  // Can the damage value be negative
  ignoreUpperLimit: {
    type: Boolean,
    optional: true,
  },
  hideWhenTotalZero: {
    type: Boolean,
    optional: true,
  },
  hideWhenValueZero: {
    type: Boolean,
    optional: true,
  },
  // Automatically zero the adjustment on these conditions
  reset: {
    type: String,
    optional: true,
    regEx: VARIABLE_NAME_REGEX,
    min: 2,
    max: STORAGE_LIMITS.variableName,
  },
});

const ComputedOnlyAttributeSchema = createPropertySchema({
  description: {
    type: 'computedOnlyInlineCalculationField' as const,
    optional: true,
  },
  baseValue: {
    type: 'computedOnlyField' as const,
    optional: true,
  },
  spellSlotLevel: {
    type: 'computedOnlyField' as const,
    optional: true,
  },
  // The computed value of the attribute
  total: {
    type: SimpleSchema.oneOf(Number, String, Boolean),
    optional: true,
    removeBeforeCompute: true,
  },
  // The computed value of the attribute minus the damage
  value: {
    type: SimpleSchema.oneOf(Number, String, Boolean),
    defaultValue: 0,
    optional: true,
    removeBeforeCompute: true,
  },
  // The computed modifier, provided the attribute type is `ability`
  modifier: {
    type: SimpleSchema.Integer,
    optional: true,
    removeBeforeCompute: true,
  },
  // Attributes with proficiency grant it to all skills based on the attribute
  proficiency: {
    type: Number,
    allowedValues: [0, 0.49, 0.5, 1, 2],
    optional: true,
    removeBeforeCompute: true,
  },
  // Attributes with advantage grant it to all skills based on the attribute
  advantage: {
    type: SimpleSchema.Integer,
    optional: true,
    allowedValues: [-1, 0, 1],
    removeBeforeCompute: true,
  },
  // The computed creature constitution modifier for hit dice
  constitutionMod: {
    type: Number,
    optional: true,
    removeBeforeCompute: true,
  },
  // Should this attribute hide
  hide: {
    type: Boolean,
    optional: true,
    removeBeforeCompute: true,
  },
  // Denormalised tag if stat is overridden by one with the same variable name
  overridden: {
    type: Boolean,
    optional: true,
    removeBeforeCompute: true,
  },
  // A list of effect ids targeting this attribute
  'effectIds': {
    type: Array,
    optional: true,
    removeBeforeCompute: true,
  },
  'effectIds.$': {
    type: String,
  },
  'proficiencyIds': {
    type: Array,
    optional: true,
    removeBeforeCompute: true,
  },
  'proficiencyIds.$': {
    type: String,
  },
  'definitions': {
    type: Array,
    optional: true,
    removeBeforeCompute: true,
  },
  'definitions.$': {
    type: Object,
  },
  'definitions.$._id': {
    type: String,
  },
  'definitions.$.type': {
    optional: true,
    type: String,
  },
  'definitions.$.row': {
    type: Number,
    optional: true,
  },
  // Triggers that fire when this property is damaged
  'damageTriggerIds': {
    type: Object,
    optional: true,
    removeBeforeCompute: true,
  },
  'damageTriggerIds.before': {
    type: Array,
    optional: true,
  },
  'damageTriggerIds.before.$': {
    type: String,
    max: 32,
  },
  'damageTriggerIds.after': {
    type: Array,
    optional: true,
  },
  'damageTriggerIds.after.$': {
    type: String,
    max: 32,
  },
  'damageTriggerIds.afterChildren': {
    type: Array,
    optional: true,
  },
  'damageTriggerIds.afterChildren.$': {
    type: String,
    max: 32,
  },
  // Triggers that fire when this property is used to make a check
  'checkTriggerIds': {
    type: Object,
    optional: true,
    removeBeforeCompute: true,
  },
  'checkTriggerIds.before': {
    type: Array,
    optional: true,
  },
  'checkTriggerIds.before.$': {
    type: String,
    max: 32,
  },
  'checkTriggerIds.after': {
    type: Array,
    optional: true,
  },
  'checkTriggerIds.after.$': {
    type: String,
    max: 32,
  },
  'checkTriggerIds.afterChildren': {
    type: Array,
    optional: true,
  },
  'checkTriggerIds.afterChildren.$': {
    type: String,
    max: 32,
  },
});

const ComputedAttributeSchema = TypedSimpleSchema.from({})
  .extend(ComputedOnlyAttributeSchema)
  .extend(AttributeSchema);

export { AttributeSchema, ComputedOnlyAttributeSchema, ComputedAttributeSchema };

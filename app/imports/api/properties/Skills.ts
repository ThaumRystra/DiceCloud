import SimpleSchema from 'simpl-schema';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';
import TagTargetingSchema from '/imports/api/properties/subSchemas/TagTargetingSchema';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

/*
 * Skills are anything that results in a modifier to be added to a D20
 * Skills have an ability score modifier that they use as their basis
 */
const SkillSchema = createPropertySchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  // The technical, lowercase, single-word name used in formulae
  // Ignored for skilltype = save
  variableName: {
    type: String,
    regEx: VARIABLE_NAME_REGEX,
    min: 2,
    max: STORAGE_LIMITS.variableName,
    optional: true,
  },
  // The variable name of the ability this skill relies on
  ability: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.variableName,
  },
  // What type of skill is this
  skillType: {
    type: String,
    allowedValues: [
      'skill',
      'save',
      'check',
      'tool',
      'weapon',
      'armor',
      'language',
      'utility', //not displayed anywhere
    ] as const,
    defaultValue: 'skill',
  },
  // The base proficiency of this skill
  baseProficiency: {
    type: Number,
    optional: true,
    allowedValues: [0.49, 0.5, 1, 2] as const,
  },
  // The starting value, before effects
  baseValue: {
    type: 'fieldToCompute' as const,
    optional: true,
  },
  // Description of what the skill is used for
  description: {
    type: 'inlineCalculationFieldToCompute' as const,
    optional: true,
  },
  // Skills can apply their value to other calculations as a proficiency using tag targeting
}).extend(TagTargetingSchema);

const ComputedOnlySkillSchema = createPropertySchema({
  // Computed value of skill to be added to skill rolls
  value: {
    type: Number,
    defaultValue: 0,
    optional: true,
    removeBeforeCompute: true,
  },
  // The result of baseValueCalculation
  baseValue: {
    type: 'computedOnlyField' as const,
    optional: true,
  },
  description: {
    type: 'computedOnlyInlineCalculationField' as const,
    optional: true,
  },
  // Computed value added by the ability
  abilityMod: {
    type: SimpleSchema.Integer,
    optional: true,
    removeBeforeCompute: true,
  },
  // Computed advantage/disadvantage
  advantage: {
    type: SimpleSchema.Integer,
    optional: true,
    allowedValues: [-1, 0, 1] as const,
    removeBeforeCompute: true,
  },
  // Computed bonus to passive checks
  passiveBonus: {
    type: Number,
    optional: true,
    removeBeforeCompute: true,
  },
  // Computed proficiency multiplier
  proficiency: {
    type: Number,
    allowedValues: [0, 0.49, 0.5, 1, 2] as const,
    defaultValue: 0,
    removeBeforeCompute: true,
  },
  // Compiled text of all conditional benefits
  conditionalBenefits: {
    type: Array,
    optional: true,
    removeBeforeCompute: true,
  },
  'conditionalBenefits.$': {
    type: String,
  },
  // Computed number of things forcing this skill to fail
  fail: {
    type: SimpleSchema.Integer,
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
  // A list of effect ids targeting this skill
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
    type: String,
  },
  'definitions.$.row': {
    type: Number,
    optional: true,
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
})

const ComputedSkillSchema = TypedSimpleSchema.from({})
  .extend(ComputedOnlySkillSchema)
  .extend(SkillSchema);

export { SkillSchema, ComputedSkillSchema, ComputedOnlySkillSchema };

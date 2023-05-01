import SimpleSchema from 'simpl-schema';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema.js';

/*
 * Skills are anything that results in a modifier to be added to a D20
 * Skills have an ability score modifier that they use as their basis
 */
let SkillSchema = createPropertySchema({
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
    ],
    defaultValue: 'skill',
  },
  // The base proficiency of this skill
  baseProficiency: {
    type: Number,
    optional: true,
    allowedValues: [0.49, 0.5, 1, 2],
  },
  // The starting value, before effects
  baseValue: {
    type: 'fieldToCompute',
    optional: true,
  },
  // Description of what the skill is used for
  description: {
    type: 'inlineCalculationFieldToCompute',
    optional: true,
  },
});

let ComputedOnlySkillSchema = createPropertySchema({
  // Computed value of skill to be added to skill rolls
  value: {
    type: Number,
    defaultValue: 0,
    optional: true,
    removeBeforeCompute: true,
  },
  // The result of baseValueCalculation
  baseValue: {
    type: 'computedOnlyField',
    optional: true,
  },
  description: {
    type: 'computedOnlyInlineCalculationField',
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
    allowedValues: [-1, 0, 1],
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
    allowedValues: [0, 0.49, 0.5, 1, 2],
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
  // Denormalized tag if stat is overridden by one with the same variable name
  overridden: {
    type: Boolean,
    optional: true,
    removeBeforeCompute: true,
  },
  // A list of effect ids targeting this skill
  effects: {
    type: Array,
    optional: true,
    removeBeforeCompute: true,
  },
  'effects.$': {
    type: Object,
    blackbox: true,
  },
})

const ComputedSkillSchema = new SimpleSchema()
  .extend(ComputedOnlySkillSchema)
  .extend(SkillSchema);

export { SkillSchema, ComputedSkillSchema, ComputedOnlySkillSchema };

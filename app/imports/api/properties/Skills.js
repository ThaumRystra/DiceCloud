import SimpleSchema from 'simpl-schema';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX.js';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';

/*
 * Skills are anything that results in a modifier to be added to a D20
 * Skills have an ability score modifier that they use as their basis
 */
let SkillSchema = new SimpleSchema({
  name: {
		type: String,
		optional: true,
	},
  // The technical, lowercase, single-word name used in formulae
  // Ignored for skilltype = save
  variableName: {
    type: String,
    regEx: VARIABLE_NAME_REGEX,
    min: 2,
  },
	// The variable name of the ability this skill relies on
  ability: {
    type: String,
    optional: true,
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
  // The starting value, before effects
	baseValueCalculation: {
		type: String,
		optional: true,
	},
	// The base proficiency of this skill
	baseProficiency: {
		type: Number,
		optional: true,
	},
  // Description of what the skill is used for
  description: {
		type: String,
		optional: true,
	},
});

let ComputedOnlySkillSchema = new SimpleSchema({
	// Computed value of skill to be added to skill rolls
  value: {
    type: Number,
		defaultValue: 0,
  },
  // The result of baseValueCalculation
  baseValue: {
    type: SimpleSchema.oneOf(Number, String, Boolean),
    optional: true,
  },
  baseValueErrors: {
    type: Array,
    optional: true,
  },
  'baseValueErrors.$': {
    type: ErrorSchema,
  },
	// Computed value added by the ability
	abilityMod: {
		type: SimpleSchema.Integer,
		optional: true,
	},
	// Computed advantage/disadvantage
  advantage: {
    type: SimpleSchema.Integer,
    optional: true,
    allowedValues: [-1, 0, 1],
  },
	// Computed bonus to passive checks
  passiveBonus: {
    type: Number,
    optional: true,
  },
	// Computed proficiency multiplier
  proficiency: {
    type: Number,
    allowedValues: [0, 0.5, 1, 2],
		defaultValue: 0,
  },
  // Compiled text of all conditional benefits
  conditionalBenefits: {
    type: Array,
    optional: true,
  },
  'conditionalBenefits.$': {
    type: String,
  },
  // Compiled text of all roll bonuses
  rollBonuses: {
    type: Array,
    optional: true,
  },
  'rollBonuses.$': {
    type: String,
  },
	// Computed number of things forcing this skill to fail
  fail: {
    type: SimpleSchema.Integer,
    optional: true,
  },
  // Should this attribute hide
  hide: {
    type: Boolean,
    optional: true,
  },
})

const ComputedSkillSchema = new SimpleSchema()
  .extend(ComputedOnlySkillSchema)
  .extend(SkillSchema);

export { SkillSchema, ComputedSkillSchema, ComputedOnlySkillSchema };

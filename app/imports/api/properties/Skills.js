import SimpleSchema from 'simpl-schema';

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
		regEx: /^\w*[a-z]\w*$/i,
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
      "skill",
      "save",
			"check",
      "tool",
      "weapon",
      "language",
			"utility", //not displayed anywhere
    ],
    defaultValue: 'skill',
  },
	// If the baseValue is higher than the computed value, it will be used as `value`
	baseValue: {
		type: Number,
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
  // Computed number of total conditional benefits
  conditionalBenefits: {
    type: Array,
    optional: true,
  },
  'conditionalBenefits.$': {
    type: String,
  },
  // Computed number of things forcing this skill to fail
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
})

let ComputedSkillSchema = ComputedOnlySkillSchema.extend(SkillSchema);

export { SkillSchema, ComputedSkillSchema, ComputedOnlySkillSchema };

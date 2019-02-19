import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import {makeChild} from "/imports/api/parenting.js";

let Skills = new Mongo.Collection("skills");

/*
 * Skills are anything that results in a modifier to be added to a D20
 * Skills usually have an ability score modifier that they use as their basis
 */
let skillSchema = schema({
	charId: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		index: 1,
	},
  // The nice-to-read name
	name: {
		type: String,
	},
  // The technical, lowercase, single-word name used in formulae
  variableName: {
    type: String,
  },
	// The variable name of the ability this skill relies on
  ability: {
    type: String,
    optional: true,
  },
	// What type of skill is this
  type: {
    type: String,
    allowedValues: [
      "skill",
      "save",
			"stat",
      "tool",
      "weapon",
      "language",
			"utility", //not displayed anywhere
    ],
  },
  // Skills need to store their order to keep the sheet consistent
  order: {
	  type: SimpleSchema.Integer,
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
    type: SimpleSchema.Integer,
    optional: true,
  },
	// Computed boolean of whether this skill is forced to fail
  fail: {
    type: SimpleSchema.Integer,
    optional: true,
  },
});

Skills.attachSchema(skillSchema);

//Skills.attachBehaviour("softRemovable");
makeChild(Skills); //children of lots of things

export default Skills;

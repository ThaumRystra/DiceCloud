import SimpleSchema from 'simpl-schema';
import {makeChild} from "/imports/api/parenting.js";

let Skills = new Mongo.Collection("skills");

/*
 * Skills are anything that results in a modifier to be added to a D20
 * Skills usually have an ability score modifier that they use as their basis
 */
let skillSchema = new SimpleSchema({
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
  ability: {
    type: String,
    optional: true,
  },
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
	baseValue: {
		type: Number,
		optional: true,
	},
	baseProficiency: {
		type: Number,
		optional: true,
	},
  value: {
    type: Number,
		defaultValue: 0,
  },
  advantage: {
    type: SimpleSchema.Integer,
    optional: true,
    allowedValues: [-1, 0, 1],
  },
  passiveBonus: {
    type: Number,
    optional: true,
  },
  proficiency: {
    type: Number,
    allowedValues: [0, 0.5, 1, 2],
		defaultValue: 0,
  },
  conditionalBenefits: {
    type: SimpleSchema.Integer,
    optional: true,
  },
  fail: {
    type: SimpleSchema.Integer,
    optional: true,
  },
});

Skills.attachSchema(skillSchema);

//Skills.attachBehaviour("softRemovable");
makeChild(Skills); //children of lots of things

export default Skills;

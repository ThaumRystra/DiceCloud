Skills = new Mongo.Collection("skills");

/*
 * Skills are anything that results in a modifier to be added to a D20
 * Skills usually have an ability score modifier that they use as their basis
 */
Schemas.Skill = new SimpleSchema({
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
	  type: Number,
	},
  value: {
    type: Number,
    decimal: true,
		defaultValue: 0,
  },
  advantage: {
    type: Number,
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
    type: Number,
    optional: true,
  },
  fail: {
    type: Number,
    optional: true,
  },
	parent: {
		type: Schemas.Parent
	},
	enabled: {
		type: Boolean,
		defaultValue: true,
	},
});

Skills.attachSchema(Schemas.Skill);

Skills.attachBehaviour("softRemovable");
makeChild(Skills, ["enabled"]); //children of lots of things

Skills.allow(CHARACTER_SUBSCHEMA_ALLOW);
Skills.deny(CHARACTER_SUBSCHEMA_DENY);

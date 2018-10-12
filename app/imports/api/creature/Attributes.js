import {makeChild} from "/imports/api/parenting.js";

let Attributes = new Mongo.Collection("attributes");

/*
 * Attributes are whole numbered stats of a character
 */
attributeSchema = new SimpleSchema({
	charId: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		index: 1,
	},
  // The nice-to-read name
	name: {
		type: String,
		index: 1,
	},
  // The technical, lowercase, single-word name used in formulae
  variableName: {
    type: String,
  },
	// Attributes need to store their order to keep the sheet consistent
	order: {
		type: Number,
		index: 1,
	},
  type: {
    type: String,
    allowedValues: [
      "ability", //Strength, Dex, Con, etc.
      "stat", // Speed, Armor Class
      "hitDice",
      "healthBar", // Hitpoints, Temporary Hitpoints
      "resource", // Rages, sorcery points
      "spellSlot", // Level 1, 2, 3... spell slots
      "utility", // Aren't displayed, Jump height, Carry capacity
    ],
		index: 1,
  },
	baseValue: {
		type: Number,
		decimal: true,
		optional: true,
	},
  value: {
    type: Number,
    decimal: true,
		defaultValue: 0,
  },
	mod: {
		type: Number,
		optional: true,
	},
  adjustment: {
    type: Number,
    optional: true,
  },
  // Can the value be decimal?
  decimal: {
    type: Boolean,
    optional: true,
  },
	enabled: {
		type: Boolean,
		defaultValue: true,
	},
  reset: {
    type: String,
    optional: true,
    allowedValues: ["shortRest", "longRest"],
  },
  // Some things are only reset by half on rest
  resetMultiplier: {
    type: Number,
    optional: true,
  },
});

Attributes.attachSchema(attributeSchema);

Attributes.attachBehaviour("softRemovable");
makeChild(Attributes, ["enabled"]); //children of lots of things

export default Attributes;

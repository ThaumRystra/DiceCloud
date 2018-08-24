Attributes = new Mongo.Collection("attributes");

/*
 * Attributes are whole numbered stats of a character
 */
Schemas.Attribute = new SimpleSchema({
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
  type: {
    type: String,
    allowedValues: [
      "ability", //Strength, Dex, Con, etc.
      "stat", // Speed, Armor Class
      "hitDice",
      "healthBar", // Hitpoints, Temporary Hitpoints
      "resource", // Rages, sorcery points
      "spellSlot", // Level 1, 2, 3... spell slots
      "attribute", // Aren't displayed, Jump height, Carry capacity
    ],
  },
  value: {
    type: Number,
    decimal: true,
  },
  adjustment: {
    type: Number,
    optional: true,
  },
  // Can the value be decimal?
  decimal: {
    type: Boolean,
    optional: true,
  }
	parent: {
		type: Schemas.Parent
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

Attributes.attachSchema(Schemas.Attribute);

Attributes.attachBehaviour("softRemovable");
makeChild(Attributes, ["enabled"]); //children of lots of things

Attributes.allow(CHARACTER_SUBSCHEMA_ALLOW);
Attributes.deny(CHARACTER_SUBSCHEMA_DENY);

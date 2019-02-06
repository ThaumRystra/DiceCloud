import {makeChild} from "/imports/api/parenting.js";
import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";
import { canEditCreature } from '/imports/api/creature/creaturePermission.js';
import { recomputeCreatureById } from '/imports/api/creature/creatureComputation.js'
import pickKeysAsOptional from '/imports/api/pickKeysAsOptional.js';

let Attributes = new Mongo.Collection("attributes");

/*
 * Attributes are numbered stats of a character
 */
attributeSchema = schema({
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
		type: SimpleSchema.Integer,
		index: 1,
	},
  type: {
    type: String,
    allowedValues: [
      "ability", //Strength, Dex, Con, etc.
      "stat", // Speed, Armor Class
			"modifier", // Proficiency Bonus, Initiative
      "hitDice", // d12 hit dice
      "healthBar", // Hitpoints, Temporary Hitpoints
      "resource", // Rages, sorcery points
      "spellSlot", // Level 1, 2, 3... spell slots
      "utility", // Aren't displayed, Jump height, Carry capacity
    ],
		index: 1,
  },
	baseValue: {
		type: Number,
		optional: true,
	},
  value: {
    type: Number,
		defaultValue: 0,
  },
	mod: {
		type: SimpleSchema.Integer,
		optional: true,
	},
  adjustment: {
    type: SimpleSchema.Integer,
    optional: true,
  },
  // Can the value be decimal?
  decimal: {
    type: Boolean,
    optional: true,
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
	color: ColorSchema(),
});

Attributes.attachSchema(attributeSchema);

//Attributes.attachBehaviour("softRemovable");
makeChild(Attributes, ["enabled"]); //children of lots of things

let updateAttributeSchema = pickKeysAsOptional(attributeSchema, [
	'name',
	'variableName',
	'type',
	'baseValue',
	'decimal',
	'reset',
	'resetMultiplier',
	'color',
]);

const updateAttribute = new ValidatedMethod({

  name: "Attributes.methods.update",

  validate: schema({
		_id: {
			type: String,
			regEx: SimpleSchema.RegEx.Id,
		},
		update: updateAttributeSchema,
	}).validator(),

  run({_id, update}) {
		let currentAttribute = Attributes.findOne(_id);
		if (!currentAttribute){
			throw new Meteor.Error("Attributes.methods.update.denied",
      `No attributes exist with the id: ${_id}`);
		}
		let charId = currentAttribute.charId;
		if (canEditCreature(charId, this.userId)){
			Attributes.update(_id, {$set: update});
			recomputeCreatureById(charId);
		}
  },

});

const adjustAttribute = new ValidatedMethod({

  name: "Attributes.methods.adjust",

  validate: schema({
		_id: {
			type: String,
			regEx: SimpleSchema.RegEx.Id,
		},
		increment: {
			type: Number,
			optional: true
		},
		set: {
			type: Number,
			optional: true,
			custom() {
	      if (!this.isSet && !this.field('increment').isSet) {
					// either set or increment must exist
	        return SimpleSchema.ErrorTypes.REQUIRED;
	      } else if (this.isSet && this.field('increment').isSet){
					return 'Can\'t increment and set an attritbute adjustment in one operation';
				}
	    },
		},
	}).validator(),

  run({_id, increment, set}) {
		let currentAttribute = Attributes.findOne(_id);
		if (!currentAttribute){
			throw new Meteor.Error("Attributes.methods.update.denied",
      `No attributes exist with the id: ${_id}`);
		}
		let charId = currentAttribute.charId;
		if (canEditCreature(charId, this.userId)){
			if (typeof set === 'number'){
				let val = currentAttribute.value;
				// Set represents what we want the value to be after adjustment
				// So we need the actual adjustment to get to that value
				let adjustment = set - val;
				// Ajustment can't exceed total value
				if (-adjustment > val) adjustment = -val;
				// Adjustment must be negative
				if (adjustment > 0) adjustment = 0;
				Attributes.update(_id, {$set: {adjustment}});
			} else if (typeof increment === 'number'){
				let remaining = currentAttribute.value + currentAttribute.adjustment;
				let adj = currentAttribute.adjustment;
				// Can't decrease adjustment below remaining value
				if (-increment > remaining) increment = -remaining;
				// Can't increase adjustment above zero
				if (increment > -adj) increment = -adj;
				Attributes.update(_id, {$inc: {adjustment: increment}});
			}
		}
  },

});

export default Attributes;
export { updateAttribute, adjustAttribute };

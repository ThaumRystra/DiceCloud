import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';
import ColorSchema from '/imports/api/creature/subSchemas/ColorSchema.js';
import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import { assertEditPermission } from '/imports/api/creature/creaturePermissions.js';
import { recomputeCreatureById } from '/imports/api/creature/creatureComputation.js'
import { getHighestOrder } from '/imports/api/order.js';
import pickKeysAsOptional from '/imports/api/pickKeysAsOptional.js';

let Attributes = new Mongo.Collection('attributes');

/*
 * Attributes are numbered stats of a character
 */
let AttributeSchema = schema({
  // The technical, lowercase, single-word name used in formulae
  variableName: {
    type: String,
		// Must contain a letter, and be made of word characters only
		regEx: /^\w*[a-z]\w*$/i,
  },
	// How it is displayed and computed is determined by type
  type: {
    type: String,
    allowedValues: [
      'ability', //Strength, Dex, Con, etc.
      'stat', // Speed, Armor Class
			'modifier', // Proficiency Bonus, Initiative
      'hitDice', // d12 hit dice
      'healthBar', // Hitpoints, Temporary Hitpoints, can take damage
			'bar', // Displayed as a health bar, can't take damage
      'resource', // Rages, sorcery points
      'spellSlot', // Level 1, 2, 3... spell slots
      'utility', // Aren't displayed, Jump height, Carry capacity
    ],
		index: 1,
  },
	// The starting value, before effects
	baseValue: {
		type: Number,
		optional: true,
	},
	// The damage done to the attribute, always negative
  adjustment: {
    type: SimpleSchema.Integer,
    optional: true,
		max: 0,
  },
  // Can the value be decimal?
  decimal: {
    type: Boolean,
    optional: true,
  },
	// Automatically zero the adjustment on these conditions
  reset: {
    type: String,
    optional: true,
    allowedValues: ['shortRest', 'longRest'],
  },
  // Some things are only reset their adjustment by up to half of the value
  resetMultiplier: {
    type: Number,
    optional: true,
  },
});

AttributeSchema.extend(ColorSchema);

const ComputedAttributeSchema = schema({
	// The computed value of the attribute
  value: {
    type: Number,
		defaultValue: 0,
  },
	// The computed modifier, provided the attribute type is `ability`
	mod: {
		type: SimpleSchema.Integer,
		optional: true,
	},
}).extend(AttributeSchema);

Attributes.attachSchema(ComputedAttributeSchema);
Attributes.attachSchema(PropertySchema);
Attributes.attachSchema(ChildSchema);

const insertAttribute = new ValidatedMethod({

  name: 'Attributes.methods.insert',

  validate: AttributeSchema.validator({ clean: true }),

  run({attribute}) {
		const charId = attribute.charId;
		assertEditPermission(charId, this.userId);
		attribute.order = getHighestOrder({
			collection: Attributes,
			charId,
		}) + 1;
		attribute.parent = {
			id: charId,
			collection: 'Creatures',
		};
		let attId = Attributes.insert(attribute);
		recomputeCreatureById(charId);
		return attId;
  },
});

const updateAttribute = new ValidatedMethod({

  name: 'Attributes.methods.update',

  validate: schema({
		_id: {
			type: String,
			regEx: SimpleSchema.RegEx.Id,
		},
		update: AttributeSchema,
	}).validator(),

  run({_id, update}) {
		let currentAttribute = Attributes.findOne(_id, {fields: {value: 1, charId: 1}});
		if (!currentAttribute){
			throw new Meteor.Error('Attributes.methods.update.denied',
      `No attributes exist with the id: ${_id}`);
		}
		let charId = currentAttribute.charId;
		assertEditPermission(charId, this.userId)
		if (typeof update.adjustment === 'number'){
			let val = currentAttribute.value;
			if (update.adjustment < -val) update.adjustment = -val;
			if (update.adjustment > 0) update.adjustment = 0;
		}
		Attributes.update(_id, {$set: update});
		recomputeCreatureById(charId);
  },

});

const adjustAttribute = new ValidatedMethod({

  name: 'Attributes.methods.adjust',

  validate: new SimpleSchema({
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
			throw new Meteor.Error('Attributes.methods.update.denied',
      `No attributes exist with the id: ${_id}`);
		}
		let charId = currentAttribute.charId;
		assertEditPermission(charId, this.userId)
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
			let remaining = currentAttribute.value + (currentAttribute.adjustment || 0);
			let adj = currentAttribute.adjustment;
			// Can't decrease adjustment below remaining value
			if (-increment > remaining) increment = -remaining;
			// Can't increase adjustment above zero
			if (increment > -adj) increment = -adj;
			if (typeof currentAttribute.adjustment === 'number'){
				Attributes.update(_id, {$inc: {adjustment: increment}});
			} else {
				Attributes.update(_id, {$set: {adjustment: increment}});
			}
		}
  },

});

export default Attributes;
export { AttributeSchema, insertAttribute, updateAttribute, adjustAttribute };

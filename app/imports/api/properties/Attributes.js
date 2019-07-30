import { PropertySchema } from '/imports/api/properties/Properties.js'
import ColorSchema from '/imports/api/creature/subSchemas/ColorSchema.js';
import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX.js';
import getModifierFields from '/imports/api/getModifierFields.js';

// Mixins
import recomputeCreatureMixin from '/imports/api/creature/mixins/recomputeCreatureMixin.js';
import creaturePermissionMixin from '/imports/api/creature/mixins/creaturePermissionMixin.js';
import { setDocToLastMixin } from '/imports/api/creature/mixins/setDocToLastMixin.js';
import {
  setDocAncestryMixin,
  ensureAncestryContainsCharIdMixin
} from '/imports/api/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/creature/mixins/simpleSchemaMixin.js';
import updateSchemaMixin from '/imports/api/creature/mixins/updateSchemaMixin.js';
import propagateInheritanceUpdateMixin from '/imports/api/creature/mixins/propagateInheritanceUpdateMixin.js';

let Attributes = new Mongo.Collection('attributes');

/*
 * Attributes are numbered stats of a character
 */
let AttributeSchema = schema({
  name: {
		type: String,
		optional: true,
    defaultValue: 'New Attribute',
	},
  // The technical, lowercase, single-word name used in formulae
  variableName: {
    type: String,
		regEx: VARIABLE_NAME_REGEX,
    min: 3,
    defaultValue: 'newAttribute',
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
    defaultValue: 'stat',
		index: 1,
  },
	// The starting value, before effects
	baseValue: {
		type: Number,
		optional: true,
	},
	// The damage done to the attribute, always positive
  damage: {
    type: SimpleSchema.Integer,
    optional: true,
		min: 0,
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

const insertAttribute = new ValidatedMethod({
  name: 'Attributes.methods.insert',
  mixins: [
    setDocAncestryMixin,
    ensureAncestryContainsCharIdMixin,
    recomputeCreatureMixin,
    creaturePermissionMixin,
    setDocToLastMixin,
    simpleSchemaMixin,
  ],
  collection: Attributes,
  permission: 'edit',
  schema: AttributeSchema,
  run(attribute) {
    return Attributes.insert(attribute);
  },
});

const updateAttribute = new ValidatedMethod({
  name: 'Attributes.methods.update',
  mixins: [
    recomputeCreatureMixin,
    propagateInheritanceUpdateMixin,
    updateSchemaMixin,
    creaturePermissionMixin,
  ],
  collection: Attributes,
  permission: 'edit',
  schema: AttributeSchema.omit(['adjutment']),
  skipRecompute({update}){
    let fields = getModifierFields(update);
    return !fields.hasAny([
      'variableName',
      'type',
      'baseValue',
    ]);
  },
});

const adjustAttribute = new ValidatedMethod({
  name: 'Attributes.methods.adjust',
  mixins: [
    simpleSchemaMixin,
    creaturePermissionMixin,
  ],
  collection: Attributes,
  permission: 'edit',
  schema: new SimpleSchema({
    _id: SimpleSchema.RegEx.Id,
    type: {
      type: String,
      allowedValues: ['set', 'increment']
    },
    value: Number,
  }),
  run({_id, type, value}) {
		if (type === 'set'){
			let currentValue = currentAttribute.value;
			// Set represents what we want the value to be after adjustment
			// So we need the actual adjustment to get to that value
			let adjustment = value - currentValue;
			// Ajustment can't exceed total value
			if (-adjustment > currentValue) adjustment = -currentValue;
			// Adjustment must be negative
			if (adjustment > 0) adjustment = 0;
			return Attributes.update(_id, {$set: {adjustment}});
		} else if (type === 'increment'){
			let remaining = currentAttribute.value + (currentAttribute.adjustment || 0);
			let adj = currentAttribute.adjustment;
			// Can't decrease adjustment below remaining value
      let increment = value;
			if (-increment > remaining) increment = -remaining;
			// Can't increase adjustment above zero
			if (increment > -adj) increment = -adj;
			if (typeof currentAttribute.adjustment === 'number'){
				return Attributes.update(_id, {$inc: {adjustment: increment}});
			} else {
				return Attributes.update(_id, {$set: {adjustment: increment}});
			}
		}
  },
});

export default Attributes;
export { AttributeSchema, insertAttribute, updateAttribute, adjustAttribute };

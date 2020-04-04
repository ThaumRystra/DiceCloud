import { AttackSchema } from '/imports/api/properties/Attacks.js';
import SimpleSchema from 'simpl-schema';

const magicSchools = [
	'abjuration',
	'conjuration',
	'divination',
	'enchantment',
	'evocation',
	'illusion',
	'necromancy',
	'transmutation',
];

let SpellSchema = new SimpleSchema({})
.extend(AttackSchema)
.extend({
	name: {
		type: String,
		optional: true,
	},
	// If it's always prepared, it doesn't count against the number of spells
	// prepared in a spell list, and enabled should be true
	alwaysPrepared: {
		type: Boolean,
		optional: true,
	},
  // This spell ignores spell slot rules
  castWithoutSpellSlots: {
    type: Boolean,
    optional: true,
  },
	// Spell lists that this spell appears on
  spellLists: {
    type: Array,
    defaultValue: [],
  },
  'spellLists.$': {
    type: String,
  },
	description: {
		type: String,
		optional: true,
	},
	castingTime: {
		type: String,
		optional: true,
		defaultValue: 'action',
	},
	range: {
		type: String,
		optional: true,
	},
	duration: {
		type: String,
		optional: true,
		defaultValue: 'Instantaneous',
	},
	verbal: {
		type: Boolean,
		optional: true,
	},
	somatic: {
		type: Boolean,
		optional: true,
	},
	concentration: {
		type: Boolean,
		optional: true,
	},
	material: {
		type: String,
		optional: true,
	},
	ritual: {
		type: Boolean,
		optional: true,
	},
	level: {
		type: SimpleSchema.Integer,
		defaultValue: 1,
		max: 9,
		min: 0,
	},
	school: {
		type: String,
		defaultValue: 'abjuration',
		allowedValues: magicSchools,
	},
});

export { SpellSchema };

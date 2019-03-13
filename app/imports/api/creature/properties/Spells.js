import ColorSchema from '/imports/api/creature/subSchemas/ColorSchema.js';
import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';

const magicSchools = [
	'Abjuration',
	'Conjuration',
	'Divination',
	'Enchantment',
	'Evocation',
	'Illusion',
	'Necromancy',
	'Transmutation',
];

let Spells = new Mongo.Collection('spells');

let SpellSchema = schema({
	prepared: {
		type: String,
		defaultValue: 'prepared',
		allowedValues: ['prepared', 'unprepared', 'always'],
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
		defaultValue: false
	},
	somatic: {
		type: Boolean,
		defaultValue: false
	},
	concentration: {
		type: Boolean,
		defaultValue: false
	},
	material: {
		type: String,
		optional: true
	},
	ritual: {
		type: Boolean,
		defaultValue: false,
	},
	level: {
		type: SimpleSchema.Integer,
		defaultValue: 1,
	},
	school: {
		type: String,
		defaultValue: 'Abjuration',
		allowedValues: magicSchools,
	},
});

SpellSchema.extend(ColorSchema);

Spells.attachSchema(SpellSchema);
Spells.attachSchema(PropertySchema);
Spells.attachSchema(ChildSchema);

export default Spells;
export { SpellSchema };

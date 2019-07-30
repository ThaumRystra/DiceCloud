import ColorSchema from '/imports/api/creature/subSchemas/ColorSchema.js';
import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import { PropertySchema } from '/imports/api/properties/Properties.js'

// Mixins
import creaturePermissionMixin from '/imports/api/creature/mixins/creaturePermissionMixin.js';
import { setDocToLastMixin } from '/imports/api/creature/mixins/setDocToLastMixin.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/creature/mixins/simpleSchemaMixin.js';
import propagateInheritanceUpdateMixin from '/imports/api/creature/mixins/propagateInheritanceUpdateMixin.js';
import updateSchemaMixin from '/imports/api/creature/mixins/updateSchemaMixin.js';

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

let Spells = new Mongo.Collection('spells');

let SpellSchema = schema({
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

SpellSchema.extend(ColorSchema);

Spells.attachSchema(SpellSchema);
Spells.attachSchema(PropertySchema);

const insertSpell = new ValidatedMethod({
  name: 'Spells.methods.insert',
	mixins: [
    creaturePermissionMixin,
    setDocToLastMixin,
    setDocAncestryMixin,
    ensureAncestryContainsCharIdMixin,
    simpleSchemaMixin,
  ],
  collection: Spells,
  permission: 'edit',
  schema: SpellSchema,
  run(spell) {
		return Spells.insert(spell);
  },
});

const updateSpell = new ValidatedMethod({
  name: 'Spells.methods.update',
  mixins: [
		propagateInheritanceUpdateMixin,
    updateSchemaMixin,
    creaturePermissionMixin,
  ],
  collection: Spells,
  permission: 'edit',
  schema: SpellSchema,
});

export default Spells;
export { SpellSchema, insertSpell, updateSpell };

import ColorSchema from '/imports/api/creature/subSchemas/ColorSchema.js';
import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';

// Mixins
import creaturePermissionMixin from '/imports/api/mixins/creaturePermissionMixin.js';
import { setDocToLastMixin } from '/imports/api/mixins/setDocToLastMixin.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/mixins/simpleSchemaMixin.js';
import propagateInheritanceUpdateMixin from '/imports/api/mixins/propagateInheritanceUpdateMixin.js';
import updateSchemaMixin from '/imports/api/mixins/updateSchemaMixin.js';

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
	name: {
		type: String,
		optional: true,
	},
	// If it's always prepared, it doesn't count against the number of spells
	// prepared in a spell list, and enabled should be true
	alwaysPrepared: {
		type: Boolean,
		defaultValue: false,
	},
	// Spells are enabled when they are prepared, so that unprepared spells don't
	// show their actions
	enabled: {
    type: Boolean,
    defaultValue: true,
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

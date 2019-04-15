import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";
import { PropertySchema } from '/imports/api/creature/properties/Properties.js'

// Mixins
import creaturePermissionMixin from '/imports/api/creature/mixins/creaturePermissionMixin.js';
import { setDocToLastMixin } from '/imports/api/creature/mixins/setDocToLastMixin.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/creature/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/creature/mixins/simpleSchemaMixin.js';
import propagateInheritanceUpdateMixin from '/imports/api/creature/mixins/propagateInheritanceUpdateMixin.js';
import updateSchemaMixin from '/imports/api/creature/mixins/updateSchemaMixin.js';

let SpellLists = new Mongo.Collection("spellLists");

let SpellListSchema = schema({
	name: {
		type: String,
		optional: true,
	},
	description: {
		type: String,
		optional: true,
	},
	// Calculation of save DC used for all spells in this list
	saveDC: {
		type: String,
		optional: true,
	},
	// Calculation of attack bonus used for all spells in this list
	attackBonus: {
		type: String,
		optional: true,
	},
	// Calculation of how many spells in this list can be prepared
	maxPrepared: {
		type: String,
		optional: true,
	},
});

SpellListSchema.extend(ColorSchema);

SpellLists.attachSchema(SpellListSchema);
SpellLists.attachSchema(PropertySchema);

const insertSpellList = new ValidatedMethod({
  name: 'SpellLists.methods.insert',
	mixins: [
    creaturePermissionMixin,
    setDocToLastMixin,
    setDocAncestryMixin,
    ensureAncestryContainsCharIdMixin,
    simpleSchemaMixin,
  ],
  collection: SpellLists,
  permission: 'edit',
  schema: SpellListSchema,
  run(spellList) {
		return SpellLists.insert(spellList);
  },
});

const updateSpellList = new ValidatedMethod({
  name: 'SpellLists.methods.update',
  mixins: [
		propagateInheritanceUpdateMixin,
    updateSchemaMixin,
    creaturePermissionMixin,
  ],
  collection: SpellLists,
  permission: 'edit',
  schema: SpellListSchema,
});

export default SpellLists;

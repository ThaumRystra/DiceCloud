import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import { PropertySchema } from '/imports/api/properties/Properties.js'
import { EffectSchema } from '/imports/api/properties/Effects.js';

// Mixins
import creaturePermissionMixin from '/imports/api/creature/mixins/creaturePermissionMixin.js';
import { setDocToLastMixin } from '/imports/api/creature/mixins/setDocToLastMixin.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/creature/mixins/simpleSchemaMixin.js';
import propagateInheritanceUpdateMixin from '/imports/api/creature/mixins/propagateInheritanceUpdateMixin.js';
import updateSchemaMixin from '/imports/api/creature/mixins/updateSchemaMixin.js';

let Buffs = new Mongo.Collection('buffs');

let BuffSchema = new SimpleSchema({
	_id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue(){
      if (!this.isSet) return Random.id();
    }
  },
	name: {
		type: String,
		optional: true,
	},
	description: {
		type: String,
		optional: true,
	},
	duration: {
		type: String,
		optional: true,
	},
});

// The effects in the stored buff need to be resolved to a number before being
// placed on other characters, if they are applied to self, they can remain as
// calculations, provided they don't contain any rolls
let StoredBuffSchema = new SimpleSchema({
	effects: {
		type: Array,
		defaultValue: [],
	},
	'effects.$': {
		type: EffectSchema,
	},
	target: {
		type: String,
		allowedValues: [
      'self',  // the character who took the buff
      'each',  // rolled once for `each` target
      'every', // rolled once and applied to `every` target
    ],
		defaultValue: 'every',
	},
}).extend(BuffSchema);

let AppliedBuffSchema = schema({
	durationSpent: {
		type: Number,
		optional: true,
		min: 0,
	},
	appliedBy: {
		type: Object,
	},
	'appliedBy.name': {
		type: String,
	},
	'appliedBy.id': {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
	},
	'appliedBy.collection': {
		type: String,
	},
}).extend(BuffSchema);

Buffs.attachSchema(AppliedBuffSchema);
Buffs.attachSchema(PropertySchema);

const insertBuff = new ValidatedMethod({
  name: 'Buffs.methods.insert',
	mixins: [
    creaturePermissionMixin,
    setDocAncestryMixin,
    ensureAncestryContainsCharIdMixin,
		setDocToLastMixin,
    simpleSchemaMixin,
  ],
  collection: Buffs,
  permission: 'edit',
  schema: BuffSchema,
  run(buff) {
		return Buffs.insert(buff);
  },
});

const updateBuff = new ValidatedMethod({
  name: 'Buffs.methods.update',
  mixins: [
		propagateInheritanceUpdateMixin,
    updateSchemaMixin,
    creaturePermissionMixin,
  ],
  collection: Buffs,
  permission: 'edit',
  schema: BuffSchema,
});

export default Buffs;
export { AppliedBuffSchema, StoredBuffSchema, insertBuff, updateBuff };

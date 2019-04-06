import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import { PropertySchema } from '/imports/api/creature/properties/Properties.js'
import { EffectSchema } from '/imports/api/creature/properties/Effects.js';

// Mixins
import creaturePermissionMixin from '/imports/api/mixins/creaturePermissionMixin.js';
import { setDocToLastMixin } from '/imports/api/mixins/setDocToLastMixin.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/mixins/simpleSchemaMixin.js';
import propagateInheritanceUpdateMixin from '/imports/api/mixins/propagateInheritanceUpdateMixin.js';
import updateSchemaMixin from '/imports/api/mixins/updateSchemaMixin.js';

let Buffs = new Mongo.Collection('buffs');

let BuffSchema = new SimpleSchema({
	name: {
		type: String,
		optional: true,
	},
	description: {
		type: String,
		optional: true,
	},
	duration: {
		type: SimpleSchema.Integer,
		optional: true,
		min: 0,
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
      // the character who took the buff
      'self',
      // the singular `target` of the buff
      'target',
      // rolled once for `each` target
      'each',
      // rolled once and applied to `every` target
      'every'
    ],
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

import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';
import { EffectSchema } from '/imports/api/creature/properties/Effects.js';

let Buffs = new Mongo.Collection('buffs');

let BuffSchema = new SimpleSchema({
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
      // the character who took the action
      'self',
      // the singular `target` of the action
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
Buffs.attachSchema(ChildSchema);

export default Buffs;
export { AppliedBuffSchema, StoredBuffSchema };

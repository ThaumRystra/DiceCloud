import SimpleSchema from 'simpl-schema';
import { EffectSchema } from '/imports/api/properties/Effects.js';

let BuffSchema = new SimpleSchema({
	_id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
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

let AppliedBuffSchema = new SimpleSchema({
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

export { AppliedBuffSchema, StoredBuffSchema };

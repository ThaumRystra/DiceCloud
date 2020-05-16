import SimpleSchema from 'simpl-schema';

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
		type: String,
		optional: true,
	},
  applied: {
    type: Boolean,
    defaultValue: false,
    index: 1,
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
});

let AppliedBuffSchema = new SimpleSchema({
  applied: {
    type: Boolean,
    defaultValue: true,
    index: 1,
  },
	durationSpent: {
		type: Number,
		optional: true,
		min: 0,
	},
	appliedBy: {
		type: Object,
    optional: true,
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

export { AppliedBuffSchema, BuffSchema };

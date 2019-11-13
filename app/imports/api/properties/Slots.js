import SimpleSchema from 'simpl-schema';

let SlotSchema = new SimpleSchema({
	slotTags: {
    type: Array,
		defaultValue: [],
  },
	'slotTags.$': {
		type: String,
	},
});

export { SlotSchema };

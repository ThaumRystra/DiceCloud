import SimpleSchema from 'simpl-schema';

let SharingSchema = new SimpleSchema({
  owner: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		index: 1
	},
	readers: {
		type: Array,
		defaultValue: [],
		index: 1
	},
	"readers.$": {
		type: String,
		regEx: SimpleSchema.RegEx.Id
	},
	writers: {
		type: Array,
		defaultValue: [],
		index: 1
	},
	"writers.$": {
		type: String,
		regEx: SimpleSchema.RegEx.Id
	},
	public: {
		type: Boolean,
		optional: true,
		index: 1,
	},
});

export default SharingSchema;

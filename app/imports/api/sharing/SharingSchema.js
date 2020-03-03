import SimpleSchema from 'simpl-schema';
import '/imports/api/sharing/sharing.js';

let SharingSchema = new SimpleSchema({
  owner: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		index: 1
	},
	readers: {
		type: Array,
		defaultValue: [],
		index: 1,
    max: 50,
	},
	"readers.$": {
		type: String,
		regEx: SimpleSchema.RegEx.Id
	},
	writers: {
		type: Array,
		defaultValue: [],
		index: 1,
    max: 20,
	},
	"writers.$": {
		type: String,
		regEx: SimpleSchema.RegEx.Id
	},
	public: {
		type: Boolean,
		defaultValue: false,
		index: 1,
	},
});

export default SharingSchema;

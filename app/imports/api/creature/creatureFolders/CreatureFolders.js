import SimpleSchema from 'simpl-schema';

let CreatureFolders = new Mongo.Collection('creatureFolders');

let creatureFolderSchema = new SimpleSchema({
	name: {
		type: String,
		defaultValue: 'New Party',
		trim: false,
		optional: true,
	},
	creatures: {
		type: Array,
		defaultValue: [],
	},
	'creatures.$': {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
	},
	owner: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
	},
  archived: {
    type: Boolean,
    defaultValue: true,
  },
  order: {
    type: Number,
    defaultValue: 0,
  },
});

CreatureFolders.attachSchema(creatureFolderSchema);

export default CreatureFolders;

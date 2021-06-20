import SimpleSchema from 'simpl-schema';

let CreatureFolders = new Mongo.Collection('creatureFolders');

let creatureFolderSchema = new SimpleSchema({
	name: {
		type: String,
		defaultValue: 'Folder',
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
    index: 1,
	},
  archived: {
    type: Boolean,
    optional: true,
  },
  order: {
    type: Number,
    defaultValue: 0,
  },
});

CreatureFolders.attachSchema(creatureFolderSchema);

import '/imports/api/creature/creatureFolders/methods.js/index.js';
export default CreatureFolders;

import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';

let CreatureFolders = new Mongo.Collection('creatureFolders');

let creatureFolderSchema = new SimpleSchema({
  name: {
    type: String,
    trim: false,
    optional: true,
    max: STORAGE_LIMITS.name,
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

import '/imports/api/creature/creatureFolders/methods.js/index';
export default CreatureFolders;

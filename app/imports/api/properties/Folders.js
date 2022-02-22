import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

// Folders organize a character sheet into a tree, particularly to group things
// like 'race' and 'background'
let FolderSchema = new SimpleSchema({
  name: {
    type: String,
    max: STORAGE_LIMITS.name,
  },
});

const ComputedOnlyFolderSchema = new SimpleSchema({});

export { FolderSchema, ComputedOnlyFolderSchema };

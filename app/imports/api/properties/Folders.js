import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema.js';

// Folders organize a character sheet into a tree, particularly to group things
// like 'race' and 'background'
let FolderSchema = new createPropertySchema({
  name: {
    type: String,
    max: STORAGE_LIMITS.name,
  },
});

const ComputedOnlyFolderSchema = new createPropertySchema({});

export { FolderSchema, ComputedOnlyFolderSchema };

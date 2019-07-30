import SimpleSchema from 'simpl-schema';

// Folders organize a character sheet into a tree, particularly to group things
// like 'race' and 'background'
let FolderSchema = new SimpleSchema({
  name: {
    type: String,
  },
});

export { FolderSchema };

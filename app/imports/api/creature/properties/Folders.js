import schema from '/imports/api/schema.js';
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';

let Folders = new Mongo.Collection('folders');

let FolderSchema = schema({
	name: {
    type: String,
  },
});

Folders.attachSchema(FolderSchema);
Folders.attachSchema(PropertySchema);
Folders.attachSchema(ChildSchema);

export default Folders;
export { FolderSchema };

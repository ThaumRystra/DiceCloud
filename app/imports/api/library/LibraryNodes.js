import schema from '/imports/api/schema.js';
import SharingSchema from '/imports/api/sharing/SharingSchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';
import librarySchemas from '/imports/api/library/librarySchemas.js';

let LibraryNodes = new Mongo.Collection('libraryNodes');

let LibraryNodeSchema = schema({
	name: {
		type: String,
		optional: true,
	},
	libraryNodeType: {
    type: String,
    allowedValues: Object.keys(librarySchemas),
  },
});

for (let key in librarySchemas){
	let schema = new SimpleSchema({});
	schema.extend(librarySchemas[key]);
	schema.extend(LibraryNodeSchema);
	schema.extend(ChildSchema);
	if (key === 'folder'){
		schema.extend(SharingSchema);
	}
	LibraryNodes.attachSchema(schema, {
		selector: {libraryNodeType: key}
	});
}

export default LibraryNodes;
export { LibraryNodeSchema };

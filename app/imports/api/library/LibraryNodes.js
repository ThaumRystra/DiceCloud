import schema from '/imports/api/schema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';
import librarySchemas from '/imports/api/library/librarySchemas.js';

let LibraryNodes = new Mongo.Collection('libraryNodes');

const RefSchema = new SimpleSchema({
  id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1
  },
});

let LibraryNodeSchema = schema({
	name: {
		type: String,
		optional: true,
	},
	libraryNodeType: {
    type: String,
    allowedValues: Object.keys(librarySchemas),
  },
	order: {
  	type: SimpleSchema.Integer,
  	index: true,
  },
	parent: {
    type: RefSchema,
  },
	// ancestors[0] should be the library to check for permission
  ancestors: {
    type: Array,
    defaultValue: [],
  },
  'ancestors.$': {
    type: RefSchema,
  },
});

for (let key in librarySchemas){
	let schema = new SimpleSchema({});
	schema.extend(librarySchemas[key]);
	schema.extend(LibraryNodeSchema);
	schema.extend(ChildSchema);
	LibraryNodes.attachSchema(schema, {
		selector: {libraryNodeType: key}
	});
}

export default LibraryNodes;
export { LibraryNodeSchema };

import schema from '/imports/api/schema.js';
import SharingSchema from '/imports/api/sharing/SharingSchema.js';
import simpleSchemaMixin from '/imports/api/creature/mixins/simpleSchemaMixin.js';

/**
 * Libraries are trees of library nodes where each node represents a character
 * property.
 *
 * Libraries can be shared, have multiple readers and writers, and can be
 * subscribed to.
 *
 * Permissions to library nodes are controlled by the libraries they belong to.
 */
let Libraries = new Mongo.Collection('libraries');

let LibrarySchema = schema({
	name: {
    type: String,
  },
});

LibrarySchema.extend(SharingSchema);

Libraries.attachSchema(LibrarySchema);

export default Libraries;

const insertLibrary = new ValidatedMethod({
  name: 'Libraries.methods.insert',
	mixins: [
		simpleSchemaMixin,
  ],
  schema: LibrarySchema.omit('owner'),
  run(library) {
    library.owner = this.userId;
		return Libraries.insert(library);
  },
});

export { LibrarySchema, insertLibrary };

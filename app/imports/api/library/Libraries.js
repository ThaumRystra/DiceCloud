import schema from '/imports/api/schema.js';
import SharingSchema from '/imports/api/sharing/SharingSchema.js';

let Libraries = new Mongo.Collection('libraries');

let LibrarySchema = schema({
	name: {
    type: String,
  },
});

LibrarySchema.extend(SharingSchema);

Libraries.attachSchema(LibrarySchema);

export default Libraries;
export { LibrarySchema };

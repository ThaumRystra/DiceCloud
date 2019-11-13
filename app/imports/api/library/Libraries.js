import SimpleSchema from 'simpl-schema';
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

let LibrarySchema = new SimpleSchema({
	name: {
    type: String,
  },
	isDefault: {
		type: Boolean,
		optional: true,
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
  schema: LibrarySchema.omit('owner', 'isDefault'),
  run(library) {
    library.owner = this.userId;
		return Libraries.insert(library);
  },
});

const setLibraryDefault = new ValidatedMethod({
  name: 'Libraries.methods.makeLibraryDefault',
	validate: new SimpleSchema({
		_id: {
			type: String,
			regEx: SimpleSchema.RegEx.id
		},
		isDefault: {
			type: Boolean,
		},
	}).validator(),
  run({_id, isDefault}) {
		if (!Meteor.users.isAdmin()){
			throw new Meteor.Error('Permission denied', 'User must be admin to set libraries as default');
		}
		return Libraries.update(_id, {$set: {isDefault}});
  },
});

export { LibrarySchema, insertLibrary, setLibraryDefault };

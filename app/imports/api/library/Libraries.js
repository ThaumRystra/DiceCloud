import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import SharingSchema from '/imports/api/sharing/SharingSchema.js';
import simpleSchemaMixin from '/imports/api/creature/mixins/simpleSchemaMixin.js';
import { assertEditPermission, assertOwnership } from '/imports/api/sharing/sharingPermissions.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import { getUserTier } from '/imports/api/users/patreon/tiers.js'
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

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
    max: STORAGE_LIMITS.name,
  },
});

LibrarySchema.extend(SharingSchema);

Libraries.attachSchema(LibrarySchema);

export default Libraries;

const insertLibrary = new ValidatedMethod({
  name: 'libraries.insert',
	mixins: [
		simpleSchemaMixin,
  ],
  schema: LibrarySchema.omit('owner'),
  run(library) {
    if (!this.userId) {
      throw new Meteor.Error('Libraries.methods.insert.denied',
      'You need to be logged in to insert a library');
    }
    let tier = getUserTier(this.userId);
    if (!tier.paidBenefits){
      throw new Meteor.Error('Libraries.methods.insert.denied',
      `The ${tier.name} tier does not allow you to insert a library`);
    }
    library.owner = this.userId;
		return Libraries.insert(library);
  },
});

const updateLibraryName = new ValidatedMethod({
	name: 'libraries.updateName',
	validate: new SimpleSchema({
		_id: {
			type: String,
			regEx: SimpleSchema.RegEx.id
		},
		name: {
			type: String,
		},
	}).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
	run({_id, name}){
		let library = Libraries.findOne(_id);
		assertEditPermission(library, this.userId);
		Libraries.update(_id, {$set: {name}});
	},
});

const removeLibrary = new ValidatedMethod({
	name: 'libraries.remove',
	validate: new SimpleSchema({
		_id: {
			type: String,
			regEx: SimpleSchema.RegEx.id
		},
	}).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
	run({_id}){
		let library = Libraries.findOne(_id);
		assertOwnership(library, this.userId);
    this.unblock();
    removeLibaryWork(_id)
	}
});

export function removeLibaryWork(libraryId){
  Libraries.remove(libraryId);
  LibraryNodes.remove({'ancestors.id': libraryId});
}

export { LibrarySchema, insertLibrary, updateLibraryName, removeLibrary };

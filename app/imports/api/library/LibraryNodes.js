import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import ColorSchema from '/imports/api/properties/subSchemas/ColorSchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';
import propertySchemasIndex from '/imports/api/properties/propertySchemasIndex.js';
import Libraries from '/imports/api/library/Libraries.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import { softRemove } from '/imports/api/parenting/softRemove.js';
import SoftRemovableSchema from '/imports/api/parenting/SoftRemovableSchema.js';
import { storedIconsSchema } from '/imports/api/icons/Icons.js';
import '/imports/api/library/methods/index.js';
import { updateReferenceNodeWork } from '/imports/api/library/methods/updateReferenceNode.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

let LibraryNodes = new Mongo.Collection('libraryNodes');

let LibraryNodeSchema = new SimpleSchema({
	type: {
    type: String,
    allowedValues: Object.keys(propertySchemasIndex),
  },
	tags: {
		type: Array,
		defaultValue: [],
    maxCount: STORAGE_LIMITS.tagCount,
	},
	'tags.$': {
		type: String,
    max: STORAGE_LIMITS.tagLength,
	},
  icon: {
    type: storedIconsSchema,
    optional: true,
    max: STORAGE_LIMITS.icon,
  }
});

// Set up server side search index
if (Meteor.isServer) {
  LibraryNodes._ensureIndex({
    'name': 'text',
		'tags': 'text',
  });
}

for (let key in propertySchemasIndex){
	let schema = new SimpleSchema({});
	schema.extend(LibraryNodeSchema);
  schema.extend(ColorSchema);
	schema.extend(propertySchemasIndex[key]);
	schema.extend(ChildSchema);
	schema.extend(SoftRemovableSchema);
	LibraryNodes.attachSchema(schema, {
		selector: {type: key}
	});
}

function getLibrary(node){
  if (!node) throw new Meteor.Error('No node provided');
  let library = Libraries.findOne(node.ancestors[0].id);
  if (!library) throw new Meteor.Error('Library does not exist');
  return library;
}

function assertNodeEditPermission(node, userId){
  let lib = getLibrary(node);
  return assertEditPermission(lib, userId);
}

const insertNode = new ValidatedMethod({
  name: 'libraryNodes.insert',
	validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run(libraryNode) {
    delete libraryNode._id;
    assertNodeEditPermission(libraryNode, this.userId);
		let nodeId = LibraryNodes.insert(libraryNode);
    if (libraryNode.type == 'reference'){
      libraryNode._id = nodeId;
      updateReferenceNodeWork(libraryNode, this.userId);
    }
    return nodeId;
  },
});

const updateLibraryNode = new ValidatedMethod({
  name: 'libraryNodes.update',
  validate({_id, path}){
		if (!_id) return false;
		// We cannot change these fields with a simple update
		switch (path[0]){
			case 'type':
      case 'order':
      case 'parent':
      case 'ancestors':
				return false;
		}
  },
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({_id, path, value}) {
    let node = LibraryNodes.findOne(_id);
    assertNodeEditPermission(node, this.userId);
    let pathString = path.join('.');
    let modifier;
    // unset empty values
    if (value === null || value === undefined){
      modifier = {$unset: {[pathString]: 1}};
    } else {
      modifier = {$set: {[pathString]: value}};
    }
		let numUpdated = LibraryNodes.update(_id, modifier, {
			selector: {type: node.type},
		});
    if (node.type == 'reference'){
      node = LibraryNodes.findOne(_id);
      updateReferenceNodeWork(node, this.userId);
    }
    return numUpdated;
  },
});

const pushToLibraryNode = new ValidatedMethod({
	name: 'libraryNodes.push',
	validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
	run({_id, path, value}){
		let node = LibraryNodes.findOne(_id);
    assertNodeEditPermission(node, this.userId);
		return LibraryNodes.update(_id, {
			$push: {[path.join('.')]: value},
		}, {
			selector: {type: node.type},
		});
	}
});

const pullFromLibraryNode = new ValidatedMethod({
	name: 'libraryNodes.pull',
	validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
	run({_id, path, itemId}){
		let node = LibraryNodes.findOne(_id);
    assertNodeEditPermission(node, this.userId);
		return LibraryNodes.update(_id, {
			$pull: {[path.join('.')]: {_id: itemId}},
		}, {
			selector: {type: node.type},
			getAutoValues: false,
		});
	}
});

const softRemoveLibraryNode = new ValidatedMethod({
	name: 'libraryNodes.softRemove',
	validate: new SimpleSchema({
		_id: SimpleSchema.RegEx.Id
	}).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
	run({_id}){
		let node = LibraryNodes.findOne(_id);
    assertNodeEditPermission(node, this.userId);
		softRemove({_id, collection: LibraryNodes});
	}
});

export default LibraryNodes;
export {
	LibraryNodeSchema,
	insertNode,
	updateLibraryNode,
	pullFromLibraryNode,
	pushToLibraryNode,
	softRemoveLibraryNode,
};

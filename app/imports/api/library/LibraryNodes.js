import SimpleSchema from 'simpl-schema';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';
import librarySchemas from '/imports/api/library/librarySchemas.js';
import Libraries from '/imports/api/library/Libraries.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import getModifierFields from '/imports/api/getModifierFields.js';

let LibraryNodes = new Mongo.Collection('libraryNodes');

let LibraryNodeSchema = new SimpleSchema({
	type: {
    type: String,
    allowedValues: Object.keys(librarySchemas),
  },
});

for (let key in librarySchemas){
	let schema = new SimpleSchema({});
	schema.extend(librarySchemas[key]);
	schema.extend(LibraryNodeSchema);
	schema.extend(ChildSchema);
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
  name: 'LibraryNodes.methods.insert',
	validate: null,
  run(libraryNode) {
    assertNodeEditPermission(libraryNode, this.userId);
		return LibraryNodes.insert(libraryNode);
  },
});

const updateLibraryNode = new ValidatedMethod({
  name: 'LibraryNodes.methods.set',
  validate({_id, path, value, ack}){
		if (!_id) return false;
		switch (path[0]){
			case 'type':
      case 'order':
      case 'parent':
      case 'ancestors':
				return false;
		}
  },
  run({_id, path, value, ack}) {
    let node = LibraryNodes.findOne(_id);
    assertNodeEditPermission(node, this.userId);
		return LibraryNodes.update(_id, {
			$set: {[path.join('.')]: value},
		}, {
			selector: {type: node.type},
		}, error => ack && ack(error));
  },
});

function libraryNodesToTree(ancestorId){
  // Store a dict of all the nodes
  let nodeIndex = {};
  let nodeList = [];
  LibraryNodes.find({
    'ancestors.id': ancestorId
  }, {
    sort: {order: 1}
  }).forEach( node => {
    let treeNode = {
      node: node,
      children: [],
    };
    nodeIndex[node._id] = treeNode;
    nodeList.push(treeNode);
  });
  // Create a forest of trees
  let forest = [];
  // Either the node is a child of another node, or in the forest as a root
  nodeList.forEach(node => {
    if (nodeIndex[node.node.parent.id]){
      nodeIndex[node.node.parent.id].children.push(node);
    } else {
      forest.push(node);
    }
  });
  return forest;
}

export default LibraryNodes;
export { LibraryNodeSchema, insertNode, updateLibraryNode, libraryNodesToTree };

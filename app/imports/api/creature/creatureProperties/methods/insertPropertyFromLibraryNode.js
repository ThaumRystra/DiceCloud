import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import { RefSchema } from '/imports/api/parenting/ChildSchema.js';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import recomputeInactiveProperties from '/imports/api/creature/denormalise/recomputeInactiveProperties.js';
import { recomputeCreatureByDoc } from '/imports/api/creature/computation/methods/recomputeCreature.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import {
	setLineageOfDocs,
	getAncestry,
	renewDocIds
} from '/imports/api/parenting/parenting.js';
import { reorderDocs } from '/imports/api/parenting/order.js';
import { setDocToLastOrder } from '/imports/api/parenting/order.js';
import recomputeInventory from '/imports/api/creature/denormalise/recomputeInventory.js';
import fetchDocByRef from '/imports/api/parenting/fetchDocByRef.js';

const insertPropertyFromLibraryNode = new ValidatedMethod({
	name: 'creatureProperties.insertPropertyFromLibraryNode',
	validate: new SimpleSchema({
    nodeIds: {
      type: Array,
      max: 20,
    },
		'nodeIds.$': {
			type: String,
			regEx: SimpleSchema.RegEx.Id,
		},
		parentRef: {
			type: RefSchema,
		},
    order: {
      type: Number,
      optional: true,
    },
	}).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
	run({nodeIds, parentRef, order}) {
		// get the new ancestry for the properties
		let {parentDoc, ancestors} = getAncestry({parentRef});

		// Check permission to edit
    let rootCreature;
		if (parentRef.collection === 'creatures'){
      rootCreature = parentDoc;
		} else if (parentRef.collection === 'creatureProperties'){
      rootCreature = getRootCreatureAncestor(parentDoc);
		} else {
			throw `${parentRef.collection} is not a valid parent collection`
		}
    assertEditPermission(rootCreature, this.userId);

    // {libraryId: hasViewPermission}
    //let libraryPermissionMemoir = {};
    let node;
		nodeIds.forEach(nodeId => {
      // TODO: Check library view permission for each node before starting
      node = insertPropertyFromNode(nodeId, ancestors, order);
    });

    // get one of the root inserted docs
    let rootId = node._id;

    // Tree structure changed by inserts, reorder the tree
    reorderDocs({
      collection: CreatureProperties,
      ancestorId: rootCreature._id,
    });

    // The library properties need to denormalise which of them are inactive
    recomputeInactiveProperties(rootCreature._id);
    // Some of the library properties may be items or containers
    recomputeInventory(rootCreature._id);
		// Inserting a creature property invalidates dependencies: full recompute
    recomputeCreatureByDoc(rootCreature);
		// Return the docId of the last property, the inserted root property
		return rootId;
	},
});

function insertPropertyFromNode(nodeId, ancestors, order){
  // Fetch the library node and its decendents, provided they have not been
  // removed
  // TODO: Check permission to read the library this node is in
  let node = LibraryNodes.findOne({
    _id: nodeId,
    removed: {$ne: true},
  });
  if (!node) throw `Node not found for nodeId: ${nodeId}`;
  let oldParent = node.parent;
  let nodes = LibraryNodes.find({
    'ancestors.id': nodeId,
    removed: {$ne: true},
  }).fetch();

  // Convert all references into actual nodes
  nodes = reifyNodeReferences(nodes);

  // The root node is first in the array of nodes
  // It must get the first generated ID to prevent flickering
  nodes = [node, ...nodes];

  // set libraryNodeIds
  storeLibraryNodeReferences(nodes, nodeId);

  // re-map all the ancestors
  setLineageOfDocs({
    docArray: nodes,
    newAncestry: ancestors,
    oldParent,
  });

  // Give the docs new IDs without breaking internal references
  renewDocIds({
    docArray: nodes,
    collectionMap: {'libraryNodes': 'creatureProperties'}
  });

  // Order the root node
  if (order === undefined){
    setDocToLastOrder({
      collection: CreatureProperties,
      doc: node,
    });
  } else {
    node.order = order;
  }

  // Insert the creature properties
  CreatureProperties.batchInsert(nodes);
  return node;
}


function storeLibraryNodeReferences(nodes){
  nodes.forEach(node => {
    node.libraryNodeId = node._id;
  });
}

// Covert node references into actual nodes
// TODO: check permissions for each library a reference node references
function reifyNodeReferences(nodes, visitedRefs = new Set(), depth = 0){
  depth += 1;
  // New nodes added this function
  let newNodes = [];

  // Filter out the reference nodes we replace
  let resultingNodes = nodes.filter(node => {

    // We have already visited this ref and replaced it
    if (visitedRefs.has(node._id)) return false;

    // Already replaced an ancestor node
    for (let i; i < node.ancestors.length; i++){
      if (visitedRefs.has(node.ancestors[i].id)) return false;
    }

    // This isn't a reference node, continue as normal
    if (node.type !== 'reference') return true;

    // We have gone too deep, keep the reference node as an error
    if (depth > 10){
      if (Meteor.isClient) console.warn('Reference depth limit exceeded');
      node.cache = {error: 'Reference depth limit exceeded'};
      return true;
    }

    let referencedNode
    try {
      referencedNode = fetchDocByRef(node.ref);
      referencedNode.order = node.order;
      // We are definitely replacing this node, so add it to the list
      visitedRefs.add(node._id);
    } catch (e){
      node.cache = {error: e.reason || e.message || e.toString()};
      return true;
    }

    // Get all the descendants of the referenced node
    let descendents = LibraryNodes.find({
      'ancestors.id': referencedNode._id,
      removed: {$ne: true},
    }, {
      sort: {order: 1},
    }).fetch();

    // We are adding the referenced node and its descendants
    let addedNodes = [referencedNode, ...descendents];

    // re-map all the ancestors to parent the new sub-tree into our existing
    // node tree
		setLineageOfDocs({
			docArray: addedNodes,
			newAncestry: node.ancestors,
			oldParent: referencedNode.parent,
		});

    // Remove all the looped references and descendents from the new nodes
    // We can't rely on the reify recursion to do this, since the IDs are
    // getting renewed before it is called
    addedNodes = addedNodes.filter(node => {
      // Exclude removed referenced
      if (visitedRefs.has(node._id)) return false;

      // Exclude descendants of removed references
      for (let i; i < node.ancestors.length; i++){
        if (visitedRefs.has(node.ancestors[i].id)) return false;
      }
      return true;
    });

    // TODO: Force the referencedNode to take the old id of the reference
    // such that the reference's children can be kept

    // Give the new referenced sub-tree new ids
    renewDocIds({
      docArray: addedNodes,
    });

    // Reify the subtree as well with recursion
    addedNodes = reifyNodeReferences(addedNodes, visitedRefs, depth);

    // Store the new nodes from this inner loop without altering the array
    // we are looping over
    newNodes.push(...addedNodes);
  });

  // We are done filtering the array, we can add the new nodes to it
  resultingNodes.push(...newNodes);

  return resultingNodes;
}

export default insertPropertyFromLibraryNode;

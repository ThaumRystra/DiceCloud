import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties, { creaturePropertyRootCollections, type CreatureProperty } from '/imports/api/creature/creatureProperties/CreatureProperties';
import LibraryNodes, { type LibraryNode } from '/imports/api/library/LibraryNodes';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import {
  renewDocIds,
  rebuildNestedSets,
  getFilter
} from '/imports/api/parenting/parentingFunctions';
import { union } from 'lodash';
import { getDocByRefAsync } from '/imports/api/parenting/reference';
import errorToString from '/imports/api/utility/errorToString';

const insertPropertyFromLibraryNode = new ValidatedMethod({
  name: 'creatureProperties.insertPropertyFromLibraryNode',
  validate: new SimpleSchema({
    nodeIds: {
      type: Array,
      maxCount: 20,
      minCount: 1,
    },
    'nodeIds.$': {
      type: String,
      max: 32,
    },
    root: {
      type: Object,
    },
    'root.collection': {
      type: String,
      allowedValues: creaturePropertyRootCollections,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ nodeIds, root, parentId }: {
    nodeIds: string[];
    root: CreatureProperty['root'];
    parentId: string | null;
  }) {
    const rootDoc = await getDocByRefAsync(root);
    await assertEditPermission(rootDoc, this.userId);

    let parent: CreatureProperty | null = null;
    if (parentId) {
      parent = await CreatureProperties.findOneAsync(parentId) ?? null;
      if (!parent) throw new Meteor.Error('not-found', 'The parent you are tyring to add a property to could not be found');
    }

    const insertedIds = await Promise.all(nodeIds.map((nodeId, index) => insertPropertyFromNode({
      nodeId,
      root,
      parentId,
      // Add the properties to the end of the parent's children, in nodeId order
      left: (parent?.right || 1) - 0.5 + (0.001 * index)
    })));

    // Tree structure changed by inserts, reorder the tree
    await rebuildNestedSets(CreatureProperties, rootDoc!._id);

    return insertedIds;
  },
});

async function insertPropertyFromNode({ nodeId, root, parentId, left }: {
  nodeId: string,
  root: CreatureProperty['root'],
  parentId: string | null,
  left: number,
}): Promise<string> {
  // Fetch the library node and its descendants, provided they have not been
  // removed
  const node = await LibraryNodes.findOneAsync({
    _id: nodeId,
    removed: { $ne: true },
  });
  if (!node) {
    if (Meteor.isClient) return '';
    else {
      throw new Meteor.Error(
        'Insert property from library failed',
        `No library document with id '${nodeId}' was found`
      );
    }
  }

  let nodes = await LibraryNodes.find({
    ...getFilter.descendants(node),
    removed: { $ne: true },
  }).fetchAsync();

  // The root node is first in the array of nodes
  // It must get the first generated ID to prevent flickering
  nodes = [node, ...nodes];

  // Convert all references into actual nodes
  nodes = await reifyNodeReferences(nodes);

  // set libraryNodeIds
  storeLibraryNodeReferences(nodes);

  // Give the docs new IDs without breaking internal references
  renewDocIds({
    docArray: nodes,
    collectionMap: { 'libraryNodes': 'creatureProperties' }
  });

  const props: CreatureProperty[] = nodes as unknown as CreatureProperty[];
  const rootProp = props[0];

  // Mark root node as dirty
  rootProp.dirty = true;

  // Move the root node to the end of the order
  rootProp.left = left;
  rootProp.right = left;
  rootProp.parentId = parentId ?? undefined;

  //set the roots
  props.forEach(prop => {
    prop.root = root;
  });

  // Insert the creature properties
  for (const n of props) {
    await CreatureProperties.insertAsync(n);
  }
  return rootProp._id;
}

export function storeLibraryNodeReferences(nodes: (LibraryNode & { libraryNodeId?: string })[]) {
  nodes.forEach(node => {
    if (node.libraryNodeId) return;
    node.libraryNodeId = node._id;
  });
}

// Covert node references into actual nodes
// TODO: check permissions for each library a reference node references
export async function reifyNodeReferences(nodes: LibraryNode[], visitedRefs = new Set<string>(), depth = 0) {
  depth += 1;
  // New nodes added this function
  const newNodes: LibraryNode[] = [];

  // Filter out the reference nodes we replace
  const resultingNodes: LibraryNode[] = [];
  for (const node of nodes) {
    // This isn't a reference node, continue as normal
    if (node.type !== 'reference') {
      resultingNodes.push(node);
      continue;
    }

    // We have gone too deep, keep the reference node as an error
    if (depth >= 10) {
      if (Meteor.isClient) console.warn('Reference depth limit exceeded');
      node.cache = { error: 'Reference depth limit exceeded' };
      resultingNodes.push(node);
      continue;
    }

    let referencedNode: LibraryNode | undefined;
    try {
      if (!node.ref.collection || !node.ref.id) continue;
      referencedNode = await getDocByRefAsync({ id: node.ref.id, collection: node.ref.collection });
      if (!referencedNode) throw new Error('The referenced library property does not exist');
      referencedNode.tags = union(node.tags, referencedNode.tags);
      // We are definitely replacing this node, so add it to the list
      visitedRefs.add(node._id);
    } catch (e) {
      node.cache = { error: errorToString(e) };
      resultingNodes.push(node);
      continue;
    }

    // Get all the descendants of the referenced node
    const descendants = await LibraryNodes.find({
      ...getFilter.descendants(referencedNode),
      removed: { $ne: true },
    }, {
      sort: { left: 1 },
    }).fetchAsync();

    // We are adding the referenced node and its descendants
    let addedNodes = [referencedNode, ...descendants];

    // Filter all the looped references
    addedNodes = addedNodes.filter(addedNode => {
      // Add all non-reference nodes
      if (addedNode.type !== 'reference') {
        return true;
      }
      // If this exact reference has already been resolved before, filter it out
      if (visitedRefs.has(addedNode._id)) {
        return false;
      } else {
        // Otherwise mark it as visited, and keep it
        visitedRefs.add(addedNode._id);
        return true;
      }
    });

    // Before renewing Ids make sure the library node reference is stored
    storeLibraryNodeReferences(addedNodes);

    // Give the new referenced sub-tree new ids
    // The referenced node must get the id of the ref node so that the
    // descendants of the ref node keep their ancestry intact
    renewDocIds({
      docArray: addedNodes,
      idMap: { [referencedNode._id]: node._id },
    });

    // Reify the subtree as well with recursion
    addedNodes = await reifyNodeReferences(addedNodes, visitedRefs, depth);

    // Store the new nodes from this inner loop without altering the array
    // we are looping over
    newNodes.push(...addedNodes);
  }

  // We are done filtering the array, we can add the new nodes to it
  resultingNodes.push(...newNodes);

  return resultingNodes;
}

export default insertPropertyFromLibraryNode;

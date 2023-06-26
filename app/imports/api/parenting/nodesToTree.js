import { union, difference, sortBy, findLast, intersection } from 'lodash';

export function nodeArrayToTree(nodes) {
  // Store a dict and list of all the nodes
  let nodeIndex = {};
  let nodeList = [];
  nodes.forEach(node => {
    let treeNode = {
      node: node,
      children: [],
    };
    nodeIndex[node._id] = treeNode;
    nodeList.push(treeNode);
  });
  // Create a forest of trees
  let forest = [];
  // Either the node is a child of its nearest found ancestor, or in the forest as a root
  nodeList.forEach(treeNode => {
    let ancestorInForest = findLast(
      treeNode.node.ancestors,
      ancestor => !!nodeIndex[ancestor.id]
    );
    if (ancestorInForest) {
      nodeIndex[ancestorInForest.id].children.push(treeNode);
    } else {
      forest.push(treeNode);
    }
  });
  forest.nodeIndex = nodeIndex;
  return forest;
}

// Fetch the documents from a collection, and return the tree of those documents
export default function nodesToTree({
  collection, ancestorId, filter, options = {},
  includeFilteredDocAncestors = false, includeFilteredDocDescendants = false
}) {
  // Setup the filter
  let collectionFilter = {
    'ancestors.id': ancestorId,
    'removed': { $ne: true },
  };
  if (filter) {
    collectionFilter = {
      ...collectionFilter,
      ...filter,
    }
  }
  // Set up the options
  let collectionSort = {
    order: 1
  };
  if (options && options.sort) {
    collectionSort = {
      ...collectionSort,
      ...options.sort,
    }
  }
  let collectionOptions = {
    sort: collectionSort,
  }
  if (options) {
    collectionOptions = {
      ...collectionOptions,
      ...options,
    }
  }
  // Find all the nodes that match the filter
  let docs = collection.find(collectionFilter, collectionOptions).map(doc => {
    if (!filter) return doc;
    // Mark the nodes that were found by the custom filter
    doc._matchedDocumentFilter = true;
    return doc;
  });
  let ancestors = [];
  let ancestorIds = [];
  let docIds = [];
  if (filter && (includeFilteredDocAncestors || includeFilteredDocDescendants)) {
    docIds = docs.map(doc => doc._id)
  }
  if (filter && includeFilteredDocAncestors) {
    // Add all ancestor ids to an array
    docs.forEach(doc => {
      ancestorIds = union(ancestorIds, doc.ancestors.map(ref => ref.id));
    });
    // Get all the docs that are also ancestors and mark them
    docs.forEach(doc => {
      if (ancestorIds.includes(doc._id)) {
        doc._ancestorOfMatchedDocument = true;
      }
    });
    // Remove the ancestor IDs of docs we have already found
    ancestorIds = difference(ancestorIds, docIds);
    // Get the ancestor docs from the collection, don't worry about `removed` docs,
    // if their descendant was not removed, neither are they
    ancestors = collection.find({ _id: { $in: ancestorIds } }).map(doc => {
      // Mark that the nodes are ancestors of the found nodes
      doc._ancestorOfMatchedDocument = true;
      return doc;
    });
  }
  let descendants = [];
  if (filter && includeFilteredDocDescendants) {
    let exludeIds = union(ancestorIds, docIds);
    descendants = collection.find({
      '_id': { $nin: exludeIds },
      'ancestors.id': { $in: docIds },
      'removed': { $ne: true },
    }).map(doc => {
      // Mark that the nodes are descendants of the found nodes
      doc._descendantOfMatchedDocument = true;
      return doc;
    });
  }
  let nodes = sortBy([
    ...ancestors,
    ...docs,
    ...descendants
  ], 'order');
  // Find all the nodes
  return nodeArrayToTree(nodes);
}

import { chain, reverse } from 'lodash';
import { TreeDoc, treeDocFields, Reference } from '/imports/api/parenting/ChildSchema';
import { getProperties } from '/imports/api/engine/loadCreatures';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';

export function getCollectionByName(name: string): Mongo.Collection<TreeDoc> {
  const collection = Mongo.Collection.get<TreeDoc>(name)
  if (!collection) {
    throw new Meteor.Error('bad-collection-reference',
      `Parent references collection ${name}, which does not exist`
    );
  }
  return collection;
}

function assertDocFound(doc, ref) {
  if (!doc) {
    throw new Meteor.Error('document-not-found',
      `No document could be found with id: ${ref.id} in ${ref.collection}`
    );
  }
}

export function fetchDocByRefAsync(ref: Reference, options?: Mongo.Options<object>): Promise<TreeDoc> {
  const doc = getCollectionByName(ref.collection).findOneAsync(ref.id, options);
  assertDocFound(doc, ref);
  return doc;
}

export function fetchDocByRef(ref: Reference, options?: Mongo.Options<object>): TreeDoc {
  const doc: TreeDoc = getCollectionByName(ref.collection).findOne(ref.id, options);
  assertDocFound(doc, ref);
  return doc;
}

export interface TreeNode<T> {
  doc: T,
  children: TreeNode<T>[]
}

/**
 * 
 * @param nodes An array of documents that share a common root. Must already be sorted by `.left` in ascending order
 * @returns An array of tree nodes that each contain a document and its children. Children are
 * assigned based on the nearest ancestor included in the input, which may or may not be their
 * actual direct parents
 */
export function docsToForest(docs: Array<TreeDoc>): TreeNode<TreeDoc>[] {
  if (!docs.length) return [];
  const forest: TreeNode<TreeDoc>[] = [];
  const ancestorStack: TreeNode<TreeDoc>[] = [];
  let currentAncestor: TreeNode<TreeDoc> | undefined;
  docs.forEach(doc => {
    const node: TreeNode<TreeDoc> = {
      doc,
      children: [],
    };
    // Remove ancestors from the stack until we find one that contains the current document
    // Ancestor contains document if ancestor.left < doc.left and ancestor.right > doc.right
    // ancestor.left < doc.left is ensured already, because we sorted by doc.left
    while (currentAncestor && currentAncestor.doc.right < doc.left) {
      currentAncestor = ancestorStack.pop();
    }
    // Add this child to its place in the forest, either as a child of the ancestor or as the root
    // of a new tree
    if (currentAncestor) {
      currentAncestor.children.push(node);
    } else {
      forest.push(node);
    }
    // Move the last ancestor onto the stack and make this node the new one
    if (currentAncestor) ancestorStack.push(currentAncestor);
    currentAncestor = node;
  });
  return forest;
}

/**
 * Fetch the documents from a collection, and return the tree of those documents, potentially
 * including their ancestors or descendants as required
 * @param param options
 * @returns An array of tree nodes that each contain a document and its children. Children are
 * assigned based on the nearest ancestor included in the input, which may or may not be their
 * actual direct parents
 */
type FilteredDoc = {
  _descendantOfMatchedDocument?: boolean,
  _matchedDocumentFilter?: boolean,
  _ancestorOfMatchedDocument?: boolean,
} & TreeDoc;

export function filterToForest(
  collection: Mongo.Collection<TreeDoc>,
  rootId: string,
  filter?: Mongo.Selector<TreeDoc>,
  {
    options = <Mongo.Options<TreeDoc>>{},
    includeFilteredDocAncestors = false,
    includeFilteredDocDescendants = false
  } = {}
): TreeNode<FilteredDoc>[] {
  if (!Meteor.isClient) throw 'Only available on the client';
  // Setup the filter
  let collectionFilter: Mongo.Selector<TreeDoc> = {
    'root.id': rootId,
    'removed': { $ne: true },
  };
  if (filter) {
    collectionFilter = {
      ...collectionFilter,
      ...filter,
    }
  }
  // Set up the options
  let collectionSort: Mongo.Options<TreeDoc>['sort'] = {
    left: 1
  };
  if (options.sort) {
    collectionSort = {
      ...collectionSort,
      ...options.sort,
    }
  }
  let collectionOptions: Mongo.Options<TreeDoc> = {
    sort: collectionSort,
  }
  if (options) {
    collectionOptions = {
      ...collectionOptions,
      ...options,
    }
  }
  // Find all the docs that match the filter
  const docs: TreeDoc[] = collection.find(collectionFilter, collectionOptions)
    .map(doc => {
      if (!filter) return doc;
      // Mark the docs that were found by the custom filter
      doc._matchedDocumentFilter = true;
      return doc;
    });

  // Get the doc ancestors
  let ancestors: FilteredDoc[] = [];
  if (filter && includeFilteredDocAncestors) {
    ancestors = collection.find(getFilter.ancestorsOfAll(docs), collectionOptions).map((doc: FilteredDoc) => {
      // Mark that the nodes are ancestors of the found nodes
      doc._ancestorOfMatchedDocument = true;
      return doc;
    });
  }

  // Get the doc descendants
  let descendants: FilteredDoc[] = [];
  if (filter && includeFilteredDocDescendants) {
    descendants = collection.find({
      'removed': { $ne: true },
      ...getFilter.descendantsOfAll(docs),
    }).map((doc: FilteredDoc) => {
      // Mark that the nodes are descendants of the found nodes
      doc._descendantOfMatchedDocument = true;
      return doc;
    });
  }
  const nodes = chain([
    ...ancestors,
    ...docs,
    ...descendants
  ]).uniqBy('_id')
    .sortBy('left')
    .value();
  // Find all the nodes
  return docsToForest(nodes);
}

export type Forest<T extends TreeDoc> = {
  trees: TreeNode<T>[],
  nodeIndex: { [_id: string]: TreeNode<T> },
  orphanIds: string[],
}

/**
 * Takes a complete set of documents and builds a forest using just their `.parentIds`
 * Uses `.left` for sibling order within a parent only.
 * Orphans whose direct parents can't be found are collected separately
 * @param docs An array of all document that share a common root already sorted by `.left` in
 * ascending order
 * @returns forest: An array of tree nodes that each contain a document and its children.
 * orphans: an array of the same, but their parents weren't in the input array
 */
export function docsToForestByParentId<T extends TreeDoc>(docs: T[]): Forest<T> {
  // Collect all the docs in a dict by id
  const nodeIndex = <{ [_id: string]: TreeNode<T> }>{};
  docs.forEach(doc => {
    nodeIndex[doc._id] = { doc, children: [] };
  });
  // Assign the docs to their parent or the forest or orphanage
  const trees: TreeNode<T>[] = [];
  const orphanIds: string[] = [];
  docs.forEach(doc => {
    const node = nodeIndex[doc._id];
    if (!doc.parentId) {
      // Root is parent
      trees.push(node);
    } else if (nodeIndex[doc.parentId]) {
      // Parent is found
      nodeIndex[doc.parentId].children.push(node);
    } else {
      // Parent is missing, unset it, and store orphan
      node.doc.parentId = undefined;
      orphanIds.push(node.doc._id);
      trees.push(node);
    }
  });
  return {
    trees,
    orphanIds,
    nodeIndex
  };
}

export const getFilter = {
  /**
   * 
   * @param doc A document or array of documents that share a root
   * @returns A query filter that finds all the ancestors of the doc(s)
   */
  ancestors(doc: TreeDoc) {
    return {
      'root.id': doc.root.id,
      left: { $lt: doc.left },
      right: { $gt: doc.right },
    };
  },
  ancestorsOfAll(docs: Array<TreeDoc>) {
    // The ancestors of no documents is a query that returns nothing
    if (docs.length === 0) {
      return { _id: '' };
    }
    // Fallback to the simpler filter for a single document
    if (docs.length === 1) {
      return getFilter.ancestors(docs[0]);
    }
    // Build a filter that selects all ancestors
    const filter = {
      'root.id': docs[0].root.id,
      $or: <object[]>[],
    };
    docs.forEach(doc => {
      filter.$or.push({
        left: { $lt: doc.left },
        right: { $gt: doc.right },
      });
    });
    return filter;
  },
  descendantsOfRoot(rootId: string) {
    return {
      'root.id': rootId,
    }
  },
  /**
   * @param rootIds a non-empty array of ids
   */
  descendantsOfAllRoots(rootIds: string[]) {
    if (!rootIds.length) throw 'rootIds can\'t be empty';
    return {
      'root.id': { $in: rootIds },
    };
  },
  descendants(doc: TreeDoc) {
    return {
      'root.id': doc.root.id,
      left: { $gt: doc.left },
      right: { $lt: doc.right },
    };
  },
  descendantsOfAll(docs: Array<TreeDoc>) {
    // The descendants of no documents is a query that returns nothing
    if (docs.length === 0) {
      return { _id: '' };
    }
    // Fallback to the simpler filter for a single document
    if (docs.length === 1) {
      return getFilter.descendants(docs[0]);
    }
    // Build a filter that selects all descendants
    const filter = {
      'root.id': docs[0].root.id,
      $or: <{
        left: { $gt: number },
        right: { $lt: number },
      }[]>[],
    };
    docs.forEach(doc => {
      filter.$or.push({
        left: { $gt: doc.left },
        right: { $lt: doc.right },
      });
    });
    return filter;
  },
  children(doc: TreeDoc) {
    return {
      'root.id': doc.root.id,
      parentId: doc._id,
    };
  },
  parent(doc: TreeDoc) {
    return {
      _id: doc.parentId,
    };
  },
}

/**
 * Give documents new random ids and transform their references.
 * Transform collections of re-IDed docs according to the collection map
 */
export function renewDocIds({ docArray, collectionMap = {}, idMap = {} }) {
  // idMap is a map of {oldId: newId}
  // Get a random generator that's consistent on client and server
  const randomSrc = DDP.randomStream('renewDocIds');

  // Give new ids and map the changes as {oldId: newId}
  docArray.forEach(doc => {
    const oldId = doc._id;
    const newId = oldId in idMap ? idMap[oldId] : randomSrc.id();
    doc._id = newId;
    idMap[oldId] = newId;
  });

  // Get the id from the map if it exists, leave unchanged otherwise
  const remap = id => id in idMap ? idMap[id] : id

  // If there are references by id that need to be maintained when copying from 
  // a library, here is where we would update them
  docArray.forEach(doc => {
    // Remap the root and parent ids
    doc.root.id = remap(doc.root.id);
    doc.root.collection = collectionMap[doc.root.collection] || doc.root.collection;
    doc.parentId = remap(doc.parentId);

    // Remap itemIds of items selected as ammo
    doc.resource?.itemsConsumed?.forEach(itemConsumed => {
      itemConsumed.itemId = remap(itemConsumed.itemId);
    });
  });
}

/**
 * Moves a document within its root. The destination must be halfway between two positions (n.5)
 * @param doc
 * @param collection 
 */
export async function moveDocWithinRoot(doc: TreeDoc, collection: Mongo.Collection<TreeDoc>, newPosition: number) {
  let move: number;
  let includedRange;
  // Ensure the destination is at a midway point
  if (newPosition % 1 !== 0.5) {
    throw new Meteor.Error('invalid-move', 'Destination must be halfway between two positions (n.5)');
  }

  // Get the distance to move and the range between the current document and the destination
  const docSize = doc.right - doc.left + 1;
  let shiftDistance;
  if (newPosition < doc.left) {
    move = newPosition - doc.left + 0.5;
    includedRange = { left: newPosition, right: doc.left - 0.5 };
    shiftDistance = docSize;
  } else if (newPosition > doc.right) {
    move = newPosition - doc.right - 0.5;
    includedRange = { left: doc.right + 0.5, right: newPosition };
    shiftDistance = -docSize;
  } else {
    throw new Meteor.Error('invalid-move', 'Destination must be outside the doc\'s current location');
  }

  // If the move isn't meaningfully changing the doc's location, skip
  if (Math.abs(move) < 1) {
    return;
  }

  // Get the new parent of the doc after the move
  const newParent = await collection.findOneAsync({
    'root.id': doc.root.id,
    left: { $lt: newPosition },
    right: { $gt: newPosition },
  }, {
    sort: { left: -1 }, // Many ancestors match, taking the right most one gets the immediate parent
    fields: { _id: 1 },
  });
  const newParentId = newParent?._id;

  // Use bulk operations with $set only, because using $inc caused a lot of trouble with both
  // latency compensation and oplog tailing
  const bulkOps: any[] = [];

  // Move the doc and its children the move distance
  await collection.find({
    'root.id': doc.root.id,
    left: { $gte: doc.left },
    right: { $lte: doc.right },
  }, {
    fields: { _id: 1, left: 1, right: 1 },
  }).forEachAsync(moveDoc => {
    const update = {
      $set: {
        left: (moveDoc.left + move) || 0,
        right: (moveDoc.right + move) || 0,
      }
    };
    bulkOps.push({
      updateOne: {
        filter: { _id: moveDoc._id },
        update,
      }
    });
  });

  // Change the doc's parent if necessary
  if (newParentId !== doc.parentId) {
    let update;
    if (newParentId) {
      update = { $set: { parentId: newParentId } };
    } else {
      update = { $unset: { parentId: 1 } };
    }
    bulkOps.push({
      updateOne: {
        filter: { _id: doc._id },
        update,
      }
    });
  }

  // Move all the lefts and rights of documents between the current doc edge and the destination
  await collection.find({
    'root.id': doc.root.id,
    $or: [
      { left: { $gt: includedRange.left, $lt: includedRange.right } },
      { right: { $gt: includedRange.left, $lt: includedRange.right } },
    ],
  }, {
    fields: { _id: 1, left: 1, right: 1 },
  }).forEachAsync(doc => {
    const $set: { [P in keyof TreeDoc]?: TreeDoc[P] } = {};
    if (doc.left > includedRange.left && doc.left < includedRange.right) {
      $set.left = (doc.left + shiftDistance) || 0;
    }
    if (doc.right > includedRange.left && doc.right < includedRange.right) {
      $set.right = (doc.right + shiftDistance || 0);
    }
    bulkOps.push({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set },
      }
    });
  });

  await writeBulkOperations(collection, bulkOps);
  return rebuildNestedSets(collection, doc.root.id);
}

export async function moveDocBetweenRoots(doc: TreeDoc, collection: Mongo.Collection<TreeDoc>, newRoot: Reference, newPosition: number) {
  if (newRoot.id === doc.root.id) {
    throw new Meteor.Error('invalid-move', 'Document is already in the given root')
  }

  // Use bulk operations with $set only, because using $inc caused a lot of trouble with both
  // latency compensation and oplog tailing
  const bulkOps: {
    updateOne: {
      filter: Mongo.Query<TreeDoc>,
      update: Mongo.Modifier<TreeDoc>
    }
  }[] = [];

  // Get the new parent of the doc after the move
  const newParent = await collection.findOneAsync({
    'root.id': newRoot.id,
    left: { $lt: newPosition },
    right: { $gt: newPosition },
  }, {
    sort: { left: -1 }, // Many ancestors match, taking the right most one gets the immediate parent
    fields: { _id: 1 },
  });
  const newParentId = newParent?._id;

  // Change the doc's parent if necessary
  if (newParentId !== doc.parentId) {
    let update;
    if (newParentId) {
      update = { $set: { parentId: newParentId } };
    } else {
      update = { $unset: { parentId: 1 } };
    }
    bulkOps.push({
      updateOne: {
        filter: { _id: doc._id },
        update,
      }
    });
  }

  // Open a gap in the root we are moving to at the new location
  const docSize = doc.right - doc.left + 1;
  await collection.find({
    'root.id': newRoot.id,
    $or: [
      { left: { $gt: newPosition } },
      { right: { $gt: newPosition } },
    ],
  }, {
    fields: { _id: 1, left: 1, right: 1 },
  }).forEachAsync(openGapDoc => {
    const $set: { [P in keyof TreeDoc]?: TreeDoc[P] } = {};
    if (openGapDoc.left > newPosition) {
      $set.left = (openGapDoc.left + docSize) || 0;
    }
    if (openGapDoc.right > newPosition) {
      $set.right = (openGapDoc.right + docSize) || 0;
    }
    bulkOps.push({
      updateOne: {
        filter: { _id: openGapDoc._id },
        update: { $set },
      }
    });
  });

  // Move the doc and its children the move distance, and set their new root
  const move = newPosition + 0.5 - doc.left;
  await collection.find({
    'root.id': doc.root.id,
    left: { $gte: doc.left },
    right: { $lte: doc.right },
  }, {
    fields: { _id: 1, left: 1, right: 1 },
  }).forEachAsync(moveDoc => {
    bulkOps.push({
      updateOne: {
        filter: { _id: moveDoc._id },
        update: {
          $set: {
            left: (moveDoc.left + move) || 0,
            right: (moveDoc.right + move) || 0,
            root: newRoot
          }
        },
      }
    });
  });

  // Close the gap in the root we are leaving
  await collection.find({
    'root.id': doc.root.id,
    $or: [
      { left: { $gt: doc.right } },
      { right: { $gt: doc.right } },
    ],
  }, {
    fields: { _id: 1, left: 1, right: 1 },
  }).forEachAsync(closeGapDoc => {
    const $set: { [P in keyof TreeDoc]?: TreeDoc[P] } = {};
    if (closeGapDoc.left > doc.right) {
      $set.left = (closeGapDoc.left - docSize) || 0;
    }
    if (closeGapDoc.right > doc.right) {
      $set.right = (closeGapDoc.right - docSize || 0);
    }
    bulkOps.push({
      updateOne: {
        filter: { _id: closeGapDoc._id },
        update: { $set },
      }
    });
  });

  return writeBulkOperations(collection, bulkOps);
}

/**
 * Changes the doc to be a child of the parent, and then rebuilds the nested sets of the roots
 * of both doc and parent
 * @deprecated Use moveDocWithinRoot or moveDocBetweenRoots instead
 * @param doc The doc to move
 * @param parent The new parent of the doc, null to move the doc to the root of the tree
 * @param collection 
 * @returns 
 */
export async function changeParent(doc: TreeDoc, parent: TreeDoc | null, collection: Mongo.Collection<TreeDoc>, order?: number) {
  // Skip if we aren't changing the parent id
  if (doc.parentId === parent?._id) return;

  // Store the original roots
  const rootChange = parent && doc.root.id !== parent.root?.id;

  // Check that the doc isn't becoming its own ancestor
  if (parent && parent.left > doc.left && parent.right < doc.right) {
    throw new Meteor.Error('invalid parenting', 'A doc can\'t be its own ancestor');
  }

  // update the document's parenting and root if necessary
  let update: Mongo.Modifier<TreeDoc>;
  if (!parent) {
    update = {
      $unset: { parentId: 1 }
    };
  } else {
    update = {
      $set: { parentId: parent?._id }
    };
  }
  if (rootChange && update.$set) {
    update.$set.root = parent.root;
  }
  if (order) {
    if (!update.$set) update.$set = {};
    update.$set.left = order;
  }

  await collection.updateAsync(doc._id, update);

  // Rebuild the nested sets of everything on the root document(s)
  rebuildNestedSets(collection, doc.root.id);
  if (rootChange) {
    rebuildNestedSets(collection, parent.root.id);
  }
}

export function compareOrder(docA, docB) {
  // < 0 if A comes before B
  // = 0 if A and B are the same order
  // > 0 if B comes before A

  // They must share a root ancestor to be meaningfully sorted
  if (docA.root.id !== docB.root.id) {
    return 0;
  } else {
    return docA.left - docB.left;
  }
}

/**
 * Determine if two properties have an ancestor relationship, returns true if A is an ancestor of B
 * or B is an ancestor of A
 */
export function hasAncestorRelationship(propA: TreeDoc, propB: TreeDoc): boolean {
  // If they don't share a root, they can't share an ancestor relationship
  if (propA.root.id !== propB.root.id) {
    return false;
  }
  // Return if there is an parent relationship in either direction
  return propA.parentId === propB._id
    || propB.parentId === propA._id
    // or an ancestor relationship in either direction
    || isAncestor(propA, propB)
    || isAncestor(propB, propA);
}

/**
 * Returns true if A is a direct ancestor of B, assuming their roots are equal
 */
export function isAncestor(propA?: TreeDoc, propB?: TreeDoc): boolean {
  if (!propA || !propB) return false;
  return propA.left < propB.left && propA.right > propB.right;
}

/**
 * @deprecated Just set left to Number.MAX_SAFE_INTEGER instead
 */
export function setDocToLastOrder(collection: Mongo.Collection<TreeDoc>, doc: TreeDoc) {
  doc.left = Number.MAX_SAFE_INTEGER;
}

export function rebuildNestedSets(collection: Mongo.Collection<TreeDoc>, rootId: string) {
  const docs = collection.find({
    'root.id': rootId,
    removed: { $ne: true }
  }, {
    fields: treeDocFields,
    sort: {
      //Reverse sorting so that arrays can be used as stacks with the first item on top
      left: 1,
    },
  }).fetch();

  const operations = calculateNestedSetOperations(docs);
  return writeBulkOperations(collection, operations);
}

export function rebuildCreatureNestedSets(creatureId) {
  const docs = getProperties(creatureId);
  const operations = calculateNestedSetOperations(docs);
  return writeBulkOperations(CreatureProperties as Mongo.Collection<TreeDoc, TreeDoc>, operations);
}

/** Calculates the operations needed to make a tree of nested sets
  * Warning: Will reverse the order of docs!
  * Walk around the tree numbering left on the way down and right on the way up like so:
  *
  *           1 Books 12
  *               ┃
  *        2 Programming 11
  *      ┏━━━━━━━━┻━━━━━━━━━┓
  * 3 Languages 4     5 Databases 10
  *                 ┏━━━━━━━┻━━━━━━━┓  
  *            6 MongoDB 7       8 dbm 9
  *
 * 
 * @param docs 
 * @returns 
 */
export function calculateNestedSetOperations(docs: TreeDoc[]) {
  const { trees: stack, orphanIds } = docsToForestByParentId(reverse(docs));
  const removeMissingParentsOp = orphanIds.length ? {
    updateMany: {
      filter: { _id: { $in: orphanIds } },
      update: { $unset: { parentId: 1 } },
    }
  } : undefined;
  const visitedNodes = new Set();
  const visitedChildren = new Set();
  const opsById: { [_id: string]: any } = {}
  let count = 1;

  while (stack.length) {
    const top = stack[stack.length - 1];
    if (visitedNodes.has(top)) {
      // We've arrived at this node again for some reason, this shouldn't happen
      console.warn('visited already, parent loop maybe?')
      stack.pop();
    } else if (visitedChildren.has(top)) {
      // We've arrived at this node after visiting the children,
      // we must be on the way up, mark the right number
      visitedNodes.add(top);
      stack.pop();
      if (top.doc.right !== count) {
        if (!opsById[top.doc._id]) {
          opsById[top.doc._id] = {
            updateOne: {
              filter: { _id: top.doc._id },
              update: { $set: { right: count } }
            }
          }
        } else {
          opsById[top.doc._id].updateOne.update.$set.right = count;
        }
      }
      count += 1;
    } else {
      // We're arriving at this node for the first time
      // We must be on the way down, mark the left number and go visit the children
      visitedChildren.add(top);
      stack.push(...top.children);
      if (top.doc.left !== count) {
        opsById[top.doc._id] = {
          updateOne: {
            filter: { _id: top.doc._id },
            update: { $set: { left: count } },
          }
        };
      }
      count += 1;
    }
  }

  const operations = [...Object.values(opsById)];
  if (removeMissingParentsOp) operations.push(removeMissingParentsOp);
  return operations;
}

/**
 * Same as calculateNestedSetOperations, but applies the ops to the properties
 * @param docs An array of documents that share a common root. Must already be sorted by `.left` in ascending order
 * @returns The documents as a forest of tree nodes
 */
export function applyNestedSetProperties<T extends TreeDoc>(docs: T[]): Forest<T> {
  // Walk around the tree numbering left on the way down and right on the way up like so:
  const forest = docsToForestByParentId<T>(reverse([...docs]));
  const { trees, orphanIds } = forest;

  const stack = [...trees];
  const visitedNodes = new Set();
  const visitedChildren = new Set();
  let count = 1;

  while (stack.length) {
    const top = stack[stack.length - 1];
    if (orphanIds.includes(top.doc._id)) {
      delete top.doc.parentId;
    }
    if (visitedNodes.has(top)) {
      // We've arrived at this node again for some reason, this shouldn't happen
      console.warn('visited already, parent loop maybe?')
      stack.pop();
    } else if (visitedChildren.has(top)) {
      // We've arrived at this node after visiting the children,
      // we must be on the way up, mark the right number
      visitedNodes.add(top);
      stack.pop();
      if (top.doc.right !== count) {
        top.doc.right = count;
      }
      count += 1;
    } else {
      // We're arriving at this node for the first time
      // We must be on the way down, mark the left number and go visit the children
      visitedChildren.add(top);
      stack.push(...top.children);
      if (top.doc.left !== count) {
        top.doc.left = count;
      }
      count += 1;
    }
  }
  return forest;
}

/**
 * Write some number of bulk operations to the collection, uses a bulk write on the server
 * and iterates through regular updates on the client
 * Resolves once all writes have completed
 * @param collection The collection to write to
 * @param operations An array of bulk operations to write
 * @returns Promise<undefined>
 */
function writeBulkOperations(collection: Mongo.Collection<TreeDoc>, operations) {
  if (Meteor.isServer) {
    if (!operations.length) return Promise.resolve();
    return new Promise((resolve, reject) => {
      collection.rawCollection().bulkWrite(
        operations,
        { ordered: false },
        function (e) {
          if (e) {
            reject(e);
          } else {
            resolve(undefined);
          }
        }
      );
    });
  } else {
    // Don't do latency compensation if there are too many operations, it just causes client
    // lag without much benefit
    operations.forEach(op => {
      if (op.updateOne) {
        collection.update(
          op.updateOne.filter,
          op.updateOne.update,
        );
      } else if (op.updateMany) {
        collection.update(
          op.updateMany.filter,
          op.updateMany.update,
          { multi: true },
        )
      }
    });
  }
  return Promise.resolve();
}

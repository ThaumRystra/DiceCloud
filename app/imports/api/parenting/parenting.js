import fetchDocByRef from '/imports/api/parenting/fetchDocByRef.js';
import getCollectionByName from '/imports/api/parenting/getCollectionByName.js';
import { flatten, findLast } from 'lodash';

const generalParents = [
  'attribute',
  'buff',
  'classLevel',
  'feature',
  'folder',
  'root',
  'item',
  'spell',
];

// Which types are allowed as parents for other types
const allowedParenting = {
  folder: [...generalParents, 'container'],
  rollResult: ['roll', 'rollResult'],
  container: ['root', 'folder'],
  item: ['root', 'container', 'folder'],
};

const allParentTypes = new Set(flatten(Object.values(allowedParenting)));

export function canBeParent(type){
  return true;
  //TODO until there is a good reason to disallow certain parenting options,
  // this should just let the user do whatever
  return type && allParentTypes.has(type);
}

export function getAllowedParents({childType}){
  return allowedParenting[childType] || generalParents;
}

export function isParentAllowed({parentType = 'root', childType}){
  return true;
  //TODO until there is a good reason to disallow certain parenting options,
  // this should just let the user do whatever
  if (!childType) throw 'childType is required';
  let allowedParents = getAllowedParents({childType});
  return allowedParents.includes(parentType);
}

export function fetchParent({id, collection}){
  return fetchDocByRef({id, collection});
}

export function fetchChildren({ collection, parentId, filter = {}, options = {sort: {order: 1}} }){
  filter['parent.id'] = parentId;
  let children = [];
  children.push(
    ...collection.find({
      'parent.id': parentId
    }, options).fetch()
  );
  return children;
}

export function updateChildren({collection, parentId, filter = {}, modifier, options={}}){
  filter['parent.id'] = parentId;
  options.multi = true;
  collection.update(filter, modifier, options);
}

export function fetchDescendants({ collection, ancestorId, filter = {}, options}){
  filter['ancestors.id'] = ancestorId;
  let descendants = [];
  descendants.push(...collection.find(filter, options).fetch());
  return descendants;
}

export function updateDescendants({collection, ancestorId, filter = {}, modifier, options={}}){
  filter['ancestors.id'] = ancestorId;
  options.multi = true;
  options.selector = {type: 'any'};
  collection.update(filter, modifier, options);
}

export function forEachDescendant({collection, ancestorId, filter = {}, options}, callback){
  filter['ancestors.id'] = ancestorId;
  collection.find(filter, options).forEach(callback);
}

// 1 database read
export function getAncestry({parentRef, inheritedFields = {}}){
  let parentDoc = fetchDocByRef(parentRef, {fields: inheritedFields});
  let parent = { ...parentRef};
  for (let field in inheritedFields){
    if (inheritedFields[field]){
      parent[field] = parentDoc[field];
    }
  }

  // Ancestors is [...parent's ancestors, parent ref]
  let ancestors = parentDoc.ancestors || [];
  ancestors.push(parent);

  return {parentDoc, parent, ancestors};
}

export function setLineageOfDocs({docArray, oldParent, newAncestry}){
  //const oldParent = oldAncestry[oldAncestry.length - 1];
  const newParent = newAncestry[newAncestry.length - 1];
  docArray.forEach(doc => {
    if(doc.parent.id === oldParent.id){
      doc.parent = newParent;
    }
    let oldAncestors = doc.ancestors;
    let oldParentIndex = oldAncestors.findIndex(a => a.id === oldParent.id);
    doc.ancestors = [...newAncestry, ...oldAncestors.slice(oldParentIndex + 1)];
  });
}

/**
 * Give documents new random ids and transform their references.
 * Transform collections of re-IDed docs according to the collection map
 */
export function renewDocIds({docArray, collectionMap}){
  // map of {oldId: newId}
  let idMap = {};
  // Give new ids and map the changes
  docArray.forEach(doc => {
    let oldId = doc._id;
    let newId = Random.id();
    doc._id = newId;
    idMap[oldId] = newId;
  });
  const remapReference = ref => {
    if (idMap[ref.id]){
      ref.id = idMap[ref.id];
      ref.collection = collectionMap && collectionMap[ref.collection] || ref.collection;
    }
  }
  docArray.forEach(doc => {
    remapReference(doc.parent);
    doc.ancestors.forEach(remapReference);
  });
}

export function updateParent({docRef, parentRef}){
  let collection = getCollectionByName(docRef.collection);
  let oldDoc = fetchDocByRef(docRef, {fields: {
    parent: 1,
    ancestors: 1,
    type: 1,
  }});
  let updateOptions = { selector: {type: 'any'} };

  // Skip if we aren't changing the parent id
  if (oldDoc.parent.id === parentRef.id) return;

  // Get the parent and its ancestry
  let {parentDoc, parent, ancestors} = getAncestry({parentRef});

  // If the doc and its parent are in the same collection, apply the allowed
  // parent rules based on type
  if (docRef.collection === parentRef.collection){
    let parentAllowed = isParentAllowed({
      parentType: parentDoc.type,
      childType: oldDoc.type
    });
    if (!parentAllowed){
      throw new Meteor.Error('invalid parenting',
        `Can't make ${oldDoc.type} a child of ${parentDoc.type}`)
    }
  }

  // update the document's parenting
  collection.update(docRef.id, {
    $set: {parent, ancestors}
  }, updateOptions);

  // Remove the old ancestors from the descendants
  updateDescendants({
    collection,
    ancestorId: docRef.id,
    modifier: {$pullAll: {
      ancestors: oldDoc.ancestors,
    }},
    options: updateOptions,
  });

  // Add the new ancestors to the descendants
  updateDescendants({
    collection,
    ancestorId: docRef.id,
    modifier: {$push: {
      ancestors: {
        $each: ancestors,
        $position: 0,
      },
    }},
    options: updateOptions,
  });
}

export function getName(doc){
  if (doc.name) return name;
  var i = doc.ancestors.length;
  while(i--) {
    if (doc.ancestors[i].name) return doc.ancestors[i].name;
  }
}

export function nodeArrayToTree(nodes){
  // Store a dict of all the nodes
  let nodeIndex = {};
  let nodeList = [];
  nodes.forEach( node => {
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
    if (ancestorInForest){
      nodeIndex[ancestorInForest.id].children.push(treeNode);
    } else {
      forest.push(treeNode);
    }
  });
  return forest;
}

export function nodesToTree({collection, ancestorId, filter, options}){
  if (!options) options = {};
  options.sort = {order: 1};
  let nodes = collection.find({
    'ancestors.id': ancestorId,
		removed: {$ne: true},
    ...filter,
  }, options);
  return nodeArrayToTree(nodes);
}

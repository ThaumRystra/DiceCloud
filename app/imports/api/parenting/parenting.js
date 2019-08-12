import fetchDocByRef from '/imports/api/parenting/fetchDocByRef.js';
import getCollectionByName from '/imports/api/parenting/getCollectionByName.js';
import { flatten } from 'lodash';

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
  return type && allParentTypes.has(type);
}

export function getAllowedParents({childType}){
  return allowedParenting[childType] || generalParents;
}

export function isParentAllowed({parentType = 'root', childType}){
  if (!childType) throw 'childType is required';
  let allowedParents = getAllowedParents({childType});
  return allowedParents.includes(parentType);
}

export function fetchParent({id, collection}){
  return fetchDocByRef({id, collection});
}

export function fetchChildren({ collection, parentId, filter = {}, options = {sort: {order: 1}} }){
  filter["parent.id"] = parentId;
  let children = [];
  children.push(
    ...collection.find({
      "parent.id": parentId
    }, options).fetch()
  );
  return children;
}

export function updateChildren({collection, parentId, filter = {}, modifier, options={}}){
  filter["parent.id"] = parentId;
  options.multi = true;
  collection.update(filter, modifier, options);
}

export function fetchDescendants({ collection, ancestorId, filter = {}, options}){
  filter["ancestors.id"] = ancestorId;
  let descendants = [];
  descendants.push(...collection.find(filter, options).fetch());
  return descendants;
}

export function updateDescendants({collection, ancestorId, filter = {}, modifier, options={}}){
  filter["ancestors.id"] = ancestorId;
  options.multi = true;
  options.selector = {type: 'any'};
  collection.update(filter, modifier, options);
}

export function forEachDescendant({collection, ancestorId, filter = {}, options}, callback){
  filter["ancestors.id"] = ancestorId;
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

// TODO move these functions to character properties collection
export function findEnabled(collection, query, options){
  query.enabled = true;
  query['ancestors.$.enabled'] = {$not: false};
  return collection.find(query, options);
}

export function getName(doc){
  if (doc.name) return name;
  var i = doc.ancestors.length;
  while(i--) {
    if (ancestors[i].name) return ancestors[i].name;
  }
}

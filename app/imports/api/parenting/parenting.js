import fetchDocByRef from '/imports/api/parenting/fetchDocByRef.js';
import getCollectionByName from 'app/imports/api/parenting/getCollectionByName.js';

// n = collections.length
let collections = [];

export function registerCollection(collectionName){
  collections.push(collectionName);
};

// 1 database hit to get the parent by reference
export function fetchParent({id, collection}){
  return fetchDocByRef({id, collection});
};

// n database hits to get the children by parent id
export function fetchChildren({parentId, filter = {}, options}){
  filter["parent.id"] = parentId;
  let children = [];
  collections.forEach(collection => {
    children.push(
      ...collection.find({
        "parent.id": parentId
      }, options).fetch()
    );
  });
  return children;
}

// n database hits to update the decendents
export function updateChildren({parentId, filter = {}, modifier, options={}}){
  filter["parent.id"] = parentId;
  options.multi = true;
  collections.forEach(collection => {
    collection.update(filter, modifier, options);
  });
};

// n database hits to fetch the decendents by ancestor id, in no particular order
export function fetchDecendents({ancestorId, filter = {}, options}){
  filter["ancestors.id"] = ancestorId;
  let decendents = [];
  collections.forEach(collection => {
    decendents.push(...collection.find(filter, options).fetch());
  });
  return decendents;
};

// n database hits to update the decendents
export function updateDecendents({ancestorId, filter = {}, modifier, options={}}){
  filter["ancestors.id"] = ancestorId;
  options.multi = true;
  collections.forEach(collection => {
    collection.update(filter, modifier, options);
  });
};

// n database hits to get decendents to act on
export function forEachDecendent({ancestorId, filter = {}, options}, callback){
  filter["ancestors.id"] = ancestorId;
  collections.forEach(collection => {
    collection.find(filter, options).forEach(callback);
  });
};

// 1 database read
export function getParenting({id, collection}){

  // Get the parent ref
  let parentDoc = fetchDocByRef({id, collection}, {fields: {
    name: 1,
    enabled: 1,
    ancestors: 1,
  }});
  let parent = {
    id,
    collection,
    name: parentDoc.name,
    enabled: parentDoc.enabled,
  };

  // Ancestors is [...parent's ancestors, parent ref]
  let ancestors = parentDoc.ancestors;
  ancestors.push(parent);

  return {parent, ancestors};
}

export function updateParent(docRef, parentRef){
  let collection = getCollectionByName(docRef.collection);
  let oldDoc = fetchDocByRef(docRef, {fields: {
    parent: 1,
    ancestors: 1,
  }});

  // Skip if we aren't changing the parent id
  if (oldDoc.parent.id === parentRef.id) return;

  // update the document's parenting
  let {parent, ancestors} = getParenting(parentRef);
  collection.update(docRef.id, {$set: {parent, ancestors}});

  // Remove the old ancestors from the decendents
  updateDecendents({
    ancestorId: docRef.id,
    modifier: {$pullAll: {
      ancestors: oldDoc.ancestors,
    }},
  });

  // Add the new ancestors to the decendents
  updateDecendents({
    ancestorId: docRef.id,
    modifier: {$push: {
      ancestors: {
        $each: ancestors,
        $position: 0,
      },
    }},
  });
};

export function setInheritedField({id, collection, fieldName, fieldValue}){

  // Update the doc
  let collection = getCollectionByName(collection);
  collection.update(id, {$set: {
    [`${fieldName}`]: fieldValue,
  }});

  // Update the parent object of its children
  updateChildren({
    parentId: id,
    modifier: {$set: {
      [`parent.${fieldName}`]: fieldValue,
    }},
  });

  // Update the ancestors object of its decendents
  updateDecendents({
    ancestorId: id,
    modifier: {$set: {
      [`ancestors.$.${fieldName}`]: fieldValue,
    }},
  });

};

export function setEnabled({id, collection, enabled}){
  setInheritedField({
    id,
    collection,
    fieldName: 'enabled',
    fieldValue: enabled,
  });
};

export function setName({id, collection, name}){
  setInheritedField({
    id,
    collection,
    fieldName: 'name',
    fieldValue: name,
  });
};

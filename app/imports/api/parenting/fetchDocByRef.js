import getCollectionByName from '/imports/api/parenting/getCollectionByName.js';

const docNotFoundError = function({id, collection}){
  throw new Meteor.Error('document-not-found',
    `No document could be found with id: ${id} in ${collection}`
  );
};

export default function fetchDocByRef({id, collection}, options){
  return getCollectionByName(collection).findOne(id, options) ||
    docNotFoundError({id, collection});
}

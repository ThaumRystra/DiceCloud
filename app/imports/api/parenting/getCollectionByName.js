const collectionDoesntExistError = function(collectionName){
  throw new Meteor.Error('bad-collection-reference',
    `Parent references collection ${collectionName}, which does not exist`
  );
};

const getCollectionByName = function(name){
  return Mongo.Collection.get(name) || collectionDoesntExistError(name);
};

export default getCollectionByName;

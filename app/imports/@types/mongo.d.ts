declare namespace Mongo {
  interface CollectionStatic {
    get: <T>(
      collectionName: string, options?: { connection: Meteor.Connection }
    ) => Mongo.Collection<T>;
  }
}

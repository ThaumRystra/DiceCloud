type SimpleSchema = import('simpl-schema').default;
type TypedSimpleSchema<T> = import('imports/api/utility/TypedSimpleSchema').TypedSimpleSchema<T>;

declare namespace Mongo {
  interface CollectionStatic {
    get: <T>(
      collectionName: string, options?: { connection: Meteor.Connection }
    ) => Mongo.Collection<T>;
  }
  type SchemaOptions = {
    /**
     * Set to `true` if your document must be passed through the collection's transform to properly validate
     */
    transform?: boolean,
    /**
     * Set to `true` to replace any existing schema instead of combining
     */
    replace?: boolean
    selector?: any;
  }

  interface Collection<T> {
    schema: TypedSimpleSchema<T>;
    simpleSchema<U extends Partial<T>>(selector?: U): TypedSimpleSchema<T & U>;
    /**
     * Use this method to attach a schema to a collection created by another package,
     * such as Meteor.users. It is most likely unsafe to call this method more than
     * once for a single collection, or to call this for a collection that had a
     * schema object passed to its constructor.
     * @param ss SimpleSchema instance or a schema definition object from which to create a new SimpleSchema instance
     * @param options Options
     *
     */
    attachSchema(ss: SimpleSchema | TypedSimpleSchema<T>, options?: SchemaOptions): void;
  }
}

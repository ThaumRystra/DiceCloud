type SimpleSchema = import('simpl-schema').default;
type TypedSimpleSchema<T> = import('/imports/api/utility/TypedSimpleSchema').TypedSimpleSchema<T>;

declare namespace Mongo {
  function getCollection(
    collectionName: string, options?: { connection: Meteor.Connection }
  ): Mongo.Collection<unknown>;
  type SchemaOptions = {
    /**
     * Set to `true` if your document must be passed through the collection's transform to properly validate
     */
    transform?: boolean,
    /**
     * Set to `true` to replace any existing schema instead of combining
     */
    replace?: boolean
    selector?: Record<string, unknown>;
  }

  interface Collection<T> {
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
    update(
      selector: Selector<T> | ObjectID | string,
      modifier: Modifier<T>,
      options?: {
        multi?: boolean | undefined;
        upsert?: boolean | undefined;
        arrayFilters?: Array<{ [identifier: string]: unknown }> | undefined;
        // Add Collection2 options
        selector?: Record<string, unknown>;
        getAutoValues?: boolean;
      },
      callback?: FunctionConstructor,
    ): number;
    updateAsync(
      selector: string | Mongo.ObjectID | Mongo.Selector<T>,
      modifier: Mongo.Modifier<T>,
      options?: {
        multi?: boolean | undefined;
        upsert?: boolean | undefined;
        arrayFilters?: {
          [identifier: string]: unknown;
        }[] | undefined;
        // Add Collection2 options
        selector?: Record<string, unknown>;
        getAutoValues?: boolean;
      },
      callback?: () => unknown,
    ): Promise<number>
  }
  interface Cursor<T, U = T> {
    /**
     * Watch a query. Receive callbacks as the result set changes.
     * @param callbacks Functions to call to deliver the result set as it changes
     */
    observeAsync(callbacks: ObserveCallbacks<U>): Promise<Meteor.LiveQueryHandle>;
    /**
     * Watch a query. Receive callbacks as the result set changes. Only the differences between the old and new documents are passed to the callbacks.
     * @param callbacks Functions to call to deliver the result set as it changes
     */
    observeChangesAsync(
      callbacks: ObserveChangesCallbacks<T>,
      options?: { nonMutatingCallbacks?: boolean | undefined },
    ): Promise<Meteor.LiveQueryHandle>;
  }
}

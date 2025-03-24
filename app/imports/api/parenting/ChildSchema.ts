import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { InferType, TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';
import type { Simplify } from 'type-fest';

export interface Reference {
  collection: string,
  id: string,
}

const RefSchema = TypedSimpleSchema.from({
  id: {
    type: String,
    max: 32,
  },
  collection: {
    type: String,
    max: STORAGE_LIMITS.collectionName,
  },
});

const ChildSchema = TypedSimpleSchema.from({
  root: {
    type: Object,
  },
  'root.id': {
    type: String,
    max: 32,
    index: 1,
  },
  'root.collection': {
    type: String,
    max: STORAGE_LIMITS.collectionName,
  },
  // Parent id of a document in the same collection
  // Undefined parent id implies the root is the parent
  parentId: {
    type: String,
    max: 32,
    optional: true,
  },
  /**
   * The tree structure goes as follows where the numbering follows a counter-clockwise depth first
   * path around the tree. The canonical structure comes from the root and parentId references,
   * while the left and right numbering is used to optimize ancestor queries.
   * 
   * Left can be used as the canonical ordering of properties in an expanded tree folder view.
   * 
   *           1 Books 12
   *               ┃
   *        2 Programming 11
   *      ┏━━━━━━━━┻━━━━━━━━━┓
   * 3 Languages 4     5 Databases 10
   *                 ┏━━━━━━━┻━━━━━━━┓  
   *            6 MongoDB 7       8 dbm 9
   */
  left: {
    type: Number,
    index: 1,
    // Default to absolutely last with space for right
    defaultValue: Number.MAX_SAFE_INTEGER - 1,
  },
  right: {
    type: Number,
    index: 1,
    // Default to zero children, so right = left + 1
    defaultValue: Number.MAX_SAFE_INTEGER,
  }
});

export const treeDocFields = {
  _id: 1,
  root: 1,
  parentId: 1,
  left: 1,
  right: 1,
}

export type TreeDoc = Simplify<{ _id: string } & InferType<typeof ChildSchema>>;

export default ChildSchema;
export { RefSchema };

import { z } from 'zod';
import type { ReferenceCollection } from '/imports/api/parenting/reference';

/**
 * Zod version of ChildSchema. Like the SimpleSchema factory, it takes the list
 * of collections allowed to be the root of the tree and returns a schema whose
 * `root.collection` is constrained to those values.
 */
const childSchema = <T extends ReferenceCollection>(rootCollections: [T, ...T[]]) =>
  z.object({
    root: z.object({
      id: z.string().max(32),
      collection: z.enum(rootCollections),
    }),
    // Parent id of a document in the same collection
    // Undefined parent id implies the root is the parent
    parentId: z.string().max(32).optional(),
    left: z.number().default(Number.MAX_SAFE_INTEGER - 1),
    right: z.number().default(Number.MAX_SAFE_INTEGER),
  });

export type TreeDoc = { _id: string } & z.infer<ReturnType<typeof childSchema>>;

export default childSchema;

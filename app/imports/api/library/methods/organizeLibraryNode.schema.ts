import { z } from 'zod';
import { libraryNodeRootCollections } from '/imports/api/library/LibraryNodes';

export const moveDocBetweenRootsArgsSchema = z.object({
  nodeId: z.string().max(32),
  newParentId: z.string().max(32),
  left: z.number(),
  newRoot: z.object({
    id: z.string().max(32),
    collection: z.enum(libraryNodeRootCollections),
  }),
  skipClient: z.boolean().optional(),
});

export const moveDocWithinRootArgsSchema = z.object({
  nodeId: z.string().max(32),
  newPosition: z.number(),
  skipClient: z.boolean().optional(),
});

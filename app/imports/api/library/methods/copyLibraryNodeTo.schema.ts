import { z } from 'zod';

export const copyLibraryNodeToArgsSchema = z.object({
  _id: z.string().max(32),
  rootId: z.string().max(32),
  parentId: z.string().max(32),
  left: z.number(),
});

import { z } from 'zod';

export const insertLibraryNodeArgsSchema = z.object({
  libraryNode: z.record(z.string(), z.unknown()),
  parentId: z.string().optional(),
});

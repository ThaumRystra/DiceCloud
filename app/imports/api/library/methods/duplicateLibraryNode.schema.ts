import { z } from 'zod';

export const duplicateLibraryNodeArgsSchema = z.object({
  _id: z.string().max(32),
});

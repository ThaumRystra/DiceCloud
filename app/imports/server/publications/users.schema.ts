import { z } from 'zod';

export const userIdsSchema = z.object({
  ids: z.array(z.string().max(32)).optional(),
});

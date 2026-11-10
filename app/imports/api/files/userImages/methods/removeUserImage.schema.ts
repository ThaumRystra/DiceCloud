import { z } from 'zod';

export const removeUserImageArgsSchema = z.object({
  fileId: z.string().max(32),
});

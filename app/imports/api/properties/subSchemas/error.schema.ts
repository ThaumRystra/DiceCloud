import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';

export const errorSchema = z.object({
  message: z.string().max(STORAGE_LIMITS.errorMessage),
  type: z.string().max(STORAGE_LIMITS.name),
});

export type ErrorSchemaType = z.infer<typeof errorSchema>;

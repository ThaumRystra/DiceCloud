import SimpleSchema from 'simpl-schema';
import { z } from 'zod';

export const removeEmailArgsSchema = z.object({
  email: z.string().regex(SimpleSchema.RegEx.Email),
});

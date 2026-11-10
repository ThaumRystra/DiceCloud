import SimpleSchema from 'simpl-schema';
import { z } from 'zod';

export const addEmailArgsSchema = z.object({
  email: z.string().regex(SimpleSchema.RegEx.Email),
});

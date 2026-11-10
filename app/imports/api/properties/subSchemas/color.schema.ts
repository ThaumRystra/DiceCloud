import { z } from 'zod';

const colorSchema = z.object({
  // match hex colors of the form #A23 or #A23f56
  color: z
    .string()
    .regex(/^#([a-f0-9]{3}){1,2}\b$/i)
    .optional(),
});

export default colorSchema;

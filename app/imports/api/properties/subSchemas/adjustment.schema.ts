import { Random } from 'meteor/random';
import { z } from 'zod';

export const adjustmentSchema = z.object({
  _id: z
    .string()
    .max(32)
    .default(() => Random.id()),
  adjustment: z.string().default('1'),
  target: z.enum(['self', 'each', 'every']),
  stat: z.string().optional(),
});

export type Adjustment = z.infer<typeof adjustmentSchema>;

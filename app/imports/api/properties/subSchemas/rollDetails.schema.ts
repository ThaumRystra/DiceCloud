import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { z } from 'zod';

export const rollDetailsSchema = z.object({
  number: z.number(),
  diceSize: z.number(),
  values: z.array(z.number()).max(STORAGE_LIMITS.diceRollValuesCount),
});

export type RollDetails = z.infer<typeof rollDetailsSchema>;

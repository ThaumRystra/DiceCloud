import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { errorSchema } from '/imports/api/properties/subSchemas/error.schema';
import { rollDetailsSchema } from '/imports/api/properties/subSchemas/rollDetails.schema';

export const logContentSchema = z.object({
  // The name of the field, included in discord webhook message
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  // The details of the field, included in discord webhook message
  value: z.string().max(STORAGE_LIMITS.summary).optional(),
  // Inline with other content fields
  inline: z.boolean().optional(),
  // This log entry was silenced
  silenced: z.boolean().optional(),
  context: z
    .object({
      errors: z
        .array(errorSchema)
        .max(STORAGE_LIMITS.errorCount)
        .default([]),
      rolls: z
        .array(rollDetailsSchema)
        .max(STORAGE_LIMITS.rollCount)
        .default([]),
      doubleRolls: z.boolean().optional(),
    })
    .optional(),
  targetIds: z.array(z.string()).optional(),
});

export type LogContent = z.infer<typeof logContentSchema>;

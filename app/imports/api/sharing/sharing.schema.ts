import SimpleSchema from 'simpl-schema';
import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';

const SharingSchema = z.object({
  owner: z.string().max(32),
  readers: z
    .array(z.string().regex(SimpleSchema.RegEx.Id))
    .max(STORAGE_LIMITS.readersCount)
    .default([]),
  writers: z
    .array(z.string().regex(SimpleSchema.RegEx.Id))
    .max(STORAGE_LIMITS.writersCount)
    .default([]),
  public: z.boolean().default(false),
  readersCanCopy: z.boolean().optional(),
});

export type Shared = z.infer<typeof SharingSchema>;

export default SharingSchema;

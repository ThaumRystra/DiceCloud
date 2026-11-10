import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';

export const journalEntrySchema = z.object({
  title: z.string().max(STORAGE_LIMITS.name).optional(),
  // Potentially long description of the event
  description: z.string().max(STORAGE_LIMITS.description).optional(),
  // The real-world date that it occured
  date: z.date().default(() => new Date()),
  // The date in-world of this event
  worldDate: z.string().max(STORAGE_LIMITS.name).optional(),
  // Tags to better find this entry later
  tags: z
    .array(z.string().max(STORAGE_LIMITS.tagLength))
    .max(STORAGE_LIMITS.tagCount)
    .default([]),
  // ID of the journal this entry belongs to
  journalId: z.string().max(32),
});

export type JournalEntry = z.infer<typeof journalEntrySchema>;

import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import SharingSchema from '/imports/api/sharing/sharing.schema';

export const baseLibrarySchema = z.object({
  _id: z.string().max(32),
  name: z.string().max(STORAGE_LIMITS.name),
  description: z.string().max(STORAGE_LIMITS.summary).optional(),
  showInMarket: z.boolean().optional(),
  subscriberCount: z.number().optional(),
});

export const librarySchema = z.object({
  ...baseLibrarySchema.shape,
  ...SharingSchema.shape,
});

export type Library = z.infer<typeof librarySchema>;

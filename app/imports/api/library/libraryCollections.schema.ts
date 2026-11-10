import { z } from 'zod';
import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import SharingSchema from '/imports/api/sharing/sharing.schema';

export const baseLibraryCollectionSchema = z.object({
  _id: z.string().max(32),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  description: z.string().max(STORAGE_LIMITS.summary).optional(),
  libraries: z
    .array(z.string().max(32))
    .max(STORAGE_LIMITS.libraryCollectionCount)
    .default([]),
  showInMarket: z.boolean().optional(),
  subscriberCount: z.number().optional(),
});

export const libraryCollectionSchema = z.object({
  ...baseLibraryCollectionSchema.shape,
  ...SharingSchema.shape,
});

export type LibraryCollection = z.infer<typeof libraryCollectionSchema>;

// Arguments for the 'libraryCollections.insert' ValidatedMethod
export const insertLibraryCollectionArgsSchema = libraryCollectionSchema.omit({
  owner: true,
  _id: true,
});

// Arguments for the 'libraryCollections.update' ValidatedMethod
export const updateLibraryCollectionArgsSchema = z.object({
  _id: z.string().max(32),
  update: z.object({
    ...libraryCollectionSchema.pick({
      name: true,
      description: true,
      showInMarket: true,
    }).shape,
    // libraries is made optional for updates
    libraries: z
      .array(z.string().max(32))
      .max(STORAGE_LIMITS.libraryCollectionCount)
      .optional(),
  }),
});

// Arguments for the 'libraryCollections.remove' ValidatedMethod
export const removeLibraryCollectionArgsSchema = z.object({
  _id: z.string().regex(SimpleSchema.RegEx.Id),
});

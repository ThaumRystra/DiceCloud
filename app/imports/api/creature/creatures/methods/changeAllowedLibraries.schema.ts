import { z } from 'zod';

export const changeAllowedLibrariesArgsSchema = z.object({
  _id: z.string().max(32),
  allowedLibraries: z.array(z.string().max(32)).max(100).optional(),
  allowedLibraryCollections: z.array(z.string().max(32)).max(100).optional(),
});

export const toggleAllUserLibrariesArgsSchema = z.object({
  _id: z.string().max(32),
  value: z.boolean(),
});

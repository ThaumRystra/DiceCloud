import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';

export const iconsSchema = z.object({
  name: z.string().max(STORAGE_LIMITS.name),
  description: z.string().max(STORAGE_LIMITS.description).optional(),
  tags: z
    .array(z.string().max(STORAGE_LIMITS.tagLength))
    .max(STORAGE_LIMITS.tagCount)
    .optional(),
  shape: z.string().max(STORAGE_LIMITS.icon),
});

export type Icon = z.infer<typeof iconsSchema>;

export const storedIconsSchema = z.object({
  name: z.string(),
  shape: z.string(),
});

export type StoredIcon = z.infer<typeof storedIconsSchema>;

// Arguments for the 'icons.write' ValidatedMethod
export const writeIconsArgsSchema = z.object({
  icons: z.array(iconsSchema),
});

// Arguments for the 'icons.find' ValidatedMethod
export const findIconsArgsSchema = z.object({
  search: z.string().max(30).optional(),
});

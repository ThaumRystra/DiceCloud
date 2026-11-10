import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';

export const experienceSchema = z.object({
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  // The amount of XP this experience gives
  xp: z.int().min(0).optional(),
  // Setting levels instead of value grants whole levels
  levels: z.int().min(0).optional(),
  // The real-world date that it occurred, usually sorted by date
  date: z.date().default(() => new Date()),
  creatureId: z.string().max(32),
});

export type Experience = z.infer<typeof experienceSchema>;

// Arguments for the 'experiences.insert' ValidatedMethod
export const insertExperienceArgsSchema = z.object({
  experience: experienceSchema.omit({ creatureId: true }),
  creatureIds: z.array(z.string().max(32)).max(12),
});

// Arguments for the 'experiences.remove' ValidatedMethod
export const removeExperienceArgsSchema = z.object({
  experienceId: z.string().max(32),
});

// Arguments for the 'experiences.recompute' ValidatedMethod
export const recomputeExperiencesArgsSchema = z.object({
  creatureId: z.string().max(32),
});

import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { logContentSchema } from '/imports/api/creature/log/logContentSchema.schema';

export const creatureLogSchema = z.object({
  content: z
    .array(logContentSchema)
    .max(STORAGE_LIMITS.logContentCount)
    .default([]),
  // The real-world date that it occured, usually sorted by date
  date: z.date().default(() => new Date()),
  // The acting creature initiating the logged events
  creatureId: z.string(),
  // The tabletop this log is associated with
  tabletopId: z.string().optional(),
  // The action that caused this log entry
  actionId: z.string().optional(),
  creatureName: z.string().max(STORAGE_LIMITS.name).optional(),
});

export type CreatureLog = z.infer<typeof creatureLogSchema>;

// Arguments for the 'creatureLogs.methods.insert' ValidatedMethod
export const insertCreatureLogArgsSchema = z.object({
  log: creatureLogSchema.omit({ date: true }),
});

// Arguments for the 'creatureLogs.methods.logForCreature' ValidatedMethod
export const logRollArgsSchema = z.object({
  roll: z.string(),
  creatureId: z.string().max(32).optional(),
});

import { z } from 'zod';
import { CreatureSchema } from '/imports/api/creature/creatures/Creatures';

export const insertCreatureArgsSchema = CreatureSchema.pick({
  name: true,
  gender: true,
  alignment: true,
  allowedLibraries: true,
  allowedLibraryCollections: true,
}).extend({
  startingLevel: z.int().min(0),
});

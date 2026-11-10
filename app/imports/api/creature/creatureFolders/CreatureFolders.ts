import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { z } from 'zod';

export const creatureFolderSchema = z.object({
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  creatures: z.array(z.string().max(32)).default([]),
  owner: z.string().max(32),
  archived: z.boolean().optional(),
  order: z.number().default(0),
});

export type CreatureFolder = z.infer<typeof creatureFolderSchema>;

const CreatureFolders = new Mongo.Collection<CreatureFolder>('creatureFolders');

CreatureFolders.attachSchema(creatureFolderSchema);

export default CreatureFolders;

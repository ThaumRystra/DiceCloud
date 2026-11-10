import type { Simplify } from 'type-fest';
import { z } from 'zod';

const archiveSchema = z.object({
  userId: z.string().max(32).brand<'UserId'>(),
  creatureId: z.string().max(32).brand<'CreatureId'>(),
  creatureName: z.string().optional(),
  fileName: z.string(),
  schemaVersion: z.number(),
  archivedAt: z.date(),
  sizeKb: z.number(),
});

export type ArchiveCreatureFileId = string & z.BRAND<'ArchiveCreatureFileId'>;
export type ArchiveCreatureFile = Simplify<
  { _id: ArchiveCreatureFileId } & z.infer<typeof archiveSchema>
>;

const ArhiveCreatureFiles = new Mongo.Collection<ArchiveCreatureFile>(
  'archiveCreatureFiles2',
);
ArhiveCreatureFiles.attachSchema(archiveSchema);

export { archiveSchema, ArhiveCreatureFiles as ArchiveCreatureFiles };

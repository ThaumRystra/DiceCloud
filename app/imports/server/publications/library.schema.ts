import { z } from 'zod';

export const libraryIdSchema = z.object({
  libraryId: z.string().max(32),
});

export const extraFieldsSchema = z.object({
  extraFields: z.array(z.string()).optional(),
});

export const nodeIdSchema = z.object({
  libraryNodeId: z.string().max(32),
});

import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import {
  inlineCaluclationFieldSchema,
  computedInlineCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/inlineCalculationField.schema';

export const folderSchema = z.object({
  type: z.literal('folder'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  description: inlineCaluclationFieldSchema,
  groupStats: z.boolean().optional(),
  hideStatsGroup: z.boolean().optional(),
  tab: z
    .enum([
      'stats',
      'features',
      'actions',
      'spells',
      'inventory',
      'journal',
      'build',
    ])
    .optional(),
  location: z
    .enum(['start', 'events', 'stats', 'skills', 'proficiencies', 'end'])
    .optional(),
});

export const computedFolderSchema = z.object({
  ...folderSchema.shape,
  description: computedInlineCalculationFieldSchema,
});

export type Folder = z.infer<typeof folderSchema>;
export type ComputedFolder = z.infer<typeof computedFolderSchema>;

import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';

export const allowedLibraryNodeReferenceCollections = ['libraryNodes' as const];

export const referenceSchema = z.object({
  type: z.literal('reference'),
  ref: z.object({
    id: z.string().optional(),
    collection: z.enum(allowedLibraryNodeReferenceCollections).optional(),
  }),
  // Denormalised store of referenced property's details
  cache: z.object({
    error: z.string().max(STORAGE_LIMITS.errorMessage).optional(),
    node: z
      .object({
        name: z.string().max(STORAGE_LIMITS.name).optional(),
        type: z.string().max(STORAGE_LIMITS.variableName),
        level: z.number().optional(),
        value: z.number().optional(),
      })
      .optional(),
    library: z
      .object({
        id: z.string().optional(),
        name: z.string().max(STORAGE_LIMITS.name).optional(),
      })
      .optional(),
  }),
});

export const computedReferenceSchema = z.object({
  ...referenceSchema.shape,
});

export type Reference = z.infer<typeof referenceSchema>;
export type ComputedReference = z.infer<typeof computedReferenceSchema>;

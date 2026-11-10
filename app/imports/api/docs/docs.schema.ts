import { z } from 'zod';
import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { storedIconsSchema } from '/imports/api/icons/icons.schema';
import childSchema from '/imports/api/parenting/childSchema.schema';
import { softRemovableSchema } from '/imports/api/parenting/softRemovable.schema';

export const baseDocSchema = z.object({
  _id: z.string().max(32),
  name: z.string().max(STORAGE_LIMITS.description),
  urlName: z
    .string()
    .min(2)
    .max(STORAGE_LIMITS.variableName)
    .regex(/[a-z]+(?:[a-z]|-)+/),
  href: z.string(),
  description: z.string().optional(),
  published: z.boolean().optional(),
  icon: storedIconsSchema.optional(),
});

export const docSchema = z.object({
  ...baseDocSchema.shape,
  ...childSchema(['docs']).shape,
  ...softRemovableSchema.shape,
});

export type Doc = z.infer<typeof docSchema>;

// Arguments for the 'docs.softRemove' ValidatedMethod
export const softRemoveDocArgsSchema = z.object({
  _id: z.string().regex(SimpleSchema.RegEx.Id),
});

// Arguments for the 'docs.restore' ValidatedMethod
export const restoreDocArgsSchema = z.object({
  _id: z.string().regex(SimpleSchema.RegEx.Id),
});

// Arguments for the 'docs.organizeDoc' ValidatedMethod
export const organizeDocArgsSchema = z.object({
  docId: z.string(),
  newPosition: z.number(),
  skipClient: z.boolean().optional(),
});

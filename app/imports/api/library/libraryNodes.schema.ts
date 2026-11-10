import { z } from 'zod';
import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import colorSchema from '/imports/api/properties/subSchemas/color.schema';
import childSchema from '/imports/api/parenting/childSchema.schema';
import { softRemovableSchema } from '/imports/api/parenting/softRemovable.schema';
import { storedIconsSchema } from '/imports/api/icons/icons.schema';
import propertySchemasIndex from '/imports/api/properties/propertySchemasIndex';

export const libraryNodeRootCollections = ['libraries' as const];

export const libraryNodeSchema = z.object({
  _id: z.string().max(32),
  type: z.enum(Object.keys(propertySchemasIndex) as [string, ...string[]]),
  tags: z
    .array(z.string().max(STORAGE_LIMITS.tagLength))
    .max(STORAGE_LIMITS.tagCount)
    .default([]),
  icon: storedIconsSchema.optional(),

  // Library-specific properties
  fillSlots: z.boolean().optional(),
  searchable: z.boolean().optional(),
  libraryTags: z
    .array(z.string().max(STORAGE_LIMITS.tagLength))
    .max(STORAGE_LIMITS.tagCount)
    .optional(),
  slotFillerType: z.string().max(STORAGE_LIMITS.variableName).optional(),
  slotFillImage: z.string().max(STORAGE_LIMITS.url).optional(),
  slotQuantityFilled: z.int().optional(),
  slotFillerCondition: z.string().max(STORAGE_LIMITS.calculation).optional(),
  slotFillerConditionNote: z.string().max(STORAGE_LIMITS.calculation).optional(),
});

export const genericLibraryNodeSchema = z.object({
  ...libraryNodeSchema.shape,
  ...colorSchema.shape,
  ...childSchema(['libraries']).shape,
  ...softRemovableSchema.shape,
});

export type GenericLibraryNode = z.infer<typeof genericLibraryNodeSchema>;

// Arguments for the 'libraryNodes.softRemove' ValidatedMethod
export const softRemoveLibraryNodeArgsSchema = z.object({
  _id: z.string().regex(SimpleSchema.RegEx.Id),
});

// Arguments for the 'libraryNodes.restore' ValidatedMethod
export const restoreLibraryNodeArgsSchema = z.object({
  _id: z.string().regex(SimpleSchema.RegEx.Id),
});

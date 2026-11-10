import { propertySchema } from '/imports/api/properties/property.schema';
import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { storedIconsSchema } from '/imports/api/icons/icons.schema';
import colorSchema from '/imports/api/properties/subSchemas/color.schema';
import childSchema from '/imports/api/parenting/childSchema.schema';
import { softRemovableSchema } from '/imports/api/parenting/softRemovable.schema';

export const creaturePropertyRootCollections: ['creatures'] = ['creatures'];

export const genericCreaturePropertySchema = z.object({
  _id: z.string().brand('CreatureId'),
  ...colorSchema.shape,
  ...childSchema(creaturePropertyRootCollections).shape,
  ...softRemovableSchema.shape,
  _migrationError: z.string().optional(),
  // allowedValues are the dynamic keys of propertySchemasIndex
  type: z.string(),
  tags: z
    .array(z.string().max(STORAGE_LIMITS.tagLength))
    .max(STORAGE_LIMITS.tagCount)
    .default([]),
  disabled: z.boolean().optional(),
  icon: storedIconsSchema.optional(),
  // Reference to the library node that this property was copied from
  libraryNodeId: z.string().max(32).optional(),
  // Fill more than one quantity in a slot
  slotQuantityFilled: z.int().optional(),
});

export const computedGenericCreaturePropertySchema = z.object({
  ...genericCreaturePropertySchema.shape,
  inactive: z.boolean().optional(),
  deactivatedByAncestor: z.boolean().optional(),
  deactivatedBySelf: z.boolean().optional(),
  deactivatedByToggle: z.boolean().optional(),
  deactivatingToggleId: z.string().max(32).optional(),
  triggerIds: z
    .object({
      before: z.array(z.string().max(32)).optional(),
      after: z.array(z.string().max(32)).optional(),
      afterChildren: z.array(z.string().max(32)).optional(),
    })
    .optional(),
});

export type GenericCreatureProperty = z.infer<
  typeof genericCreaturePropertySchema
>;

export type ComputedGenericCreatureProperty = z.infer<
  typeof computedGenericCreaturePropertySchema
>;

export const creaturePropertySchema =
  genericCreaturePropertySchema.and(propertySchema);

export type CreatureProperty = z.infer<typeof creaturePropertySchema>;

export const CreatureProperties = new Mongo.Collection<CreatureProperty>(
  'creatureProperties',
);

// Attach the default schema
CreatureProperties.attachSchema(genericCreaturePropertySchema);

// Attach the schemas for each type
propertySchema.options.forEach((option) => {
  const type = option.shape.type.value;
  if (type === 'reference') return;
  const schema = genericCreaturePropertySchema.and(option);
  CreatureProperties.attachSchema(schema, { selector: { type } });
});

import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

// Creature templates represent creatures that don't yet exist
// Used to store creatures in the library, or as templates for another creature to summon
const CreatureTemplateSchema = createPropertySchema({
  name: {
    type: String,
    max: STORAGE_LIMITS.name,
    optional: true,
  },
  description: {
    type: 'inlineCalculationFieldToCompute' as const,
    optional: true,
  },
  picture: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.url,
  },
  avatarPicture: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.url,
  },
});

const ComputedOnlyCreatureTemplateSchema = createPropertySchema({
  description: {
    type: 'computedOnlyInlineCalculationField' as const,
    optional: true,
  },
});

const ComputedCreatureTemplateSchema = TypedSimpleSchema.from({})
  .extend(CreatureTemplateSchema)
  .extend(ComputedOnlyCreatureTemplateSchema);

export { CreatureTemplateSchema, ComputedCreatureTemplateSchema, ComputedOnlyCreatureTemplateSchema };

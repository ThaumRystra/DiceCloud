import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';

// Creature templates represent creatures that don't yet exist
// Used to store creatures in the library, or as templates for another creature to summon
const CreatureTemplateSchema = createPropertySchema({
  name: {
    type: String,
    max: STORAGE_LIMITS.name,
    optional: true,
  },
  description: {
    type: 'inlineCalculationFieldToCompute',
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
    type: 'computedOnlyInlineCalculationField',
    optional: true,
  },
});

const ComputedCreatureTemplateSchema = new SimpleSchema({})
  .extend(CreatureTemplateSchema)
  .extend(ComputedOnlyCreatureTemplateSchema);

export { CreatureTemplateSchema, ComputedCreatureTemplateSchema, ComputedOnlyCreatureTemplateSchema };

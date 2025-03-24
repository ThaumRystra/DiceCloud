import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

// Folders organize a character sheet into a tree, particularly to group things
// like 'race' and 'background'
const FolderSchema = createPropertySchema({
  name: {
    type: String,
    max: STORAGE_LIMITS.name,
    optional: true,
  },
  description: {
    type: 'inlineCalculationFieldToCompute' as const,
    optional: true,
  },
  groupStats: {
    type: Boolean,
    optional: true,
  },
  hideStatsGroup: {
    type: Boolean,
    optional: true,
  },
  tab: {
    type: String,
    optional: true,
    allowedValues: [
      'stats', 'features', 'actions', 'spells', 'inventory', 'journal', 'build'
    ] as const,
  },
  location: {
    type: String,
    optional: true,
    allowedValues: [
      'start', 'events', 'stats', 'skills', 'proficiencies', 'end'
    ] as const,
  },
});

const ComputedOnlyFolderSchema = createPropertySchema({
  description: {
    type: 'computedOnlyInlineCalculationField' as const,
    optional: true,
  },
});

const ComputedFolderSchema = TypedSimpleSchema.from({})
  .extend(FolderSchema)
  .extend(ComputedOnlyFolderSchema);

export { FolderSchema, ComputedFolderSchema, ComputedOnlyFolderSchema };

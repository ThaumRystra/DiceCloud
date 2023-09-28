import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';

// Folders organize a character sheet into a tree, particularly to group things
// like 'race' and 'background'
let FolderSchema = createPropertySchema({
  name: {
    type: String,
    max: STORAGE_LIMITS.name,
    optional: true,
  },
  description: {
    type: 'inlineCalculationFieldToCompute',
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
    ],
  },
  location: {
    type: String,
    optional: true,
    allowedValues: [
      'start', 'events', 'stats', 'skills', 'proficiencies', 'end'
    ],
  },
});

const ComputedOnlyFolderSchema = createPropertySchema({
  description: {
    type: 'computedOnlyInlineCalculationField',
    optional: true,
  },
});

const ComputedFolderSchema = new SimpleSchema()
  .extend(FolderSchema)
  .extend(ComputedOnlyFolderSchema);

export { FolderSchema, ComputedFolderSchema, ComputedOnlyFolderSchema };

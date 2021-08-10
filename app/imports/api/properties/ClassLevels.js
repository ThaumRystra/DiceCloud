import SimpleSchema from 'simpl-schema';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

let ClassLevelSchema = new SimpleSchema({
	name: {
		type: String,
		optional: true,
    max: STORAGE_LIMITS.name,
	},
  // Only used by slot filling dialog, not computed
  description: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.description,
  },
	// The name of this class level's variable
	variableName: {
    type: String,
    min: 2,
		regEx: VARIABLE_NAME_REGEX,
    max: STORAGE_LIMITS.variableName,
  },
	level: {
    type: SimpleSchema.Integer,
		defaultValue: 1,
  },
	nextLevelTags: {
		type: Array,
		defaultValue: [],
	},
	'nextLevelTags.$': {
		type: String,
	},
  // Same as in SlotFillers.js
  slotFillerCondition: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.calculation,
  },
});

export { ClassLevelSchema };

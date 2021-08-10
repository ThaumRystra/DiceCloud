import SimpleSchema from 'simpl-schema';
import InlineComputationSchema from '/imports/api/properties/subSchemas/InlineComputationSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

let NoteSchema = new SimpleSchema({
	name: {
		type: String,
		optional: true,
    max: STORAGE_LIMITS.name,
	},
  summary: {
		type: String,
		optional: true,
    max: STORAGE_LIMITS.summary,
	},
	description: {
		type: String,
		optional: true,
    max: STORAGE_LIMITS.description,
	},
});

let ComputedOnlyNoteSchema = new SimpleSchema({

  summaryCalculations: {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.inlineCalculationCount,
  },
  'summaryCalculations.$': InlineComputationSchema,

  descriptionCalculations: {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.inlineCalculationCount,
  },
  'descriptionCalculations.$': InlineComputationSchema,

});

const ComputedNoteSchema = new SimpleSchema()
  .extend(NoteSchema)
  .extend(ComputedOnlyNoteSchema);

export { NoteSchema, ComputedNoteSchema, ComputedOnlyNoteSchema, };

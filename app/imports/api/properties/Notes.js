import SimpleSchema from 'simpl-schema';
import InlineComputationSchema from '/imports/api/properties/subSchemas/InlineComputationSchema.js';

let NoteSchema = new SimpleSchema({
	name: {
		type: String,
		optional: true,
	},
  summary: {
		type: String,
		optional: true,
	},
	description: {
		type: String,
		optional: true,
	},
});

let ComputedOnlyNoteSchema = new SimpleSchema({

  summaryCalculations: {
    type: Array,
    defaultValue: [],
    maxCount: 32,
  },
  'summaryCalculations.$': InlineComputationSchema,

  descriptionCalculations: {
    type: Array,
    defaultValue: [],
    maxCount: 32,
  },
  'descriptionCalculations.$': InlineComputationSchema,

});

const ComputedNoteSchema = new SimpleSchema()
  .extend(NoteSchema)
  .extend(ComputedOnlyNoteSchema);

export { NoteSchema, ComputedNoteSchema, ComputedOnlyNoteSchema, };

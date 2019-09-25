import SimpleSchema from 'simpl-schema';
import ResultsSchema from '/imports/api/properties/subSchemas/ResultsSchema.js';

let RollResultsSchema = new SimpleSchema ({
  // Expression of whether or not to apply the roll
  // Evaluates to an expression which gets compared to the roll
  // or a number which the roll must equal
  comparison: {
    type: String,
    optional: true,
  },
  results: {
		type: ResultsSchema,
		defaultValue: {},
	},
});

export { RollResultsSchema };

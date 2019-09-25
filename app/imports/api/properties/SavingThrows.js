import SimpleSchema from 'simpl-schema';
import ResultsSchema from '/imports/api/properties/subSchemas/ResultsSchema.js';

// These are the rolls made when saves are called for
// For the saving throw bonus or proficiency, see ./Skills.js
let SavingThrowSchema = new SimpleSchema ({
  dc: {
    type: String,
    optional: true,
  },
  // The variable name of ability the saving throw relies on
  ability: {
    type: String,
    optional: true,
  },
	passResults: {
		type: ResultsSchema,
		defaultValue: {},
	},
  failResults: {
    type: ResultsSchema,
		defaultValue: {},
  },
});

export { SavingThrowSchema };

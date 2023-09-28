import SimpleSchema from 'simpl-schema';
import ResultsSchema from '/imports/api/properties/subSchemas/ResultsSchema';

let RollResultsSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue() {
      if (!this.isSet) return Random.id();
    }
  },
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

export default RollResultsSchema;

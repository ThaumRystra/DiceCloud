import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';

const AdjustmentSchema = schema({
	stat: {
		type: String,
    optional: true,
	},
  roll: {
    type: String,
    optional: true,
  },
});

export default AdjustmentSchema;

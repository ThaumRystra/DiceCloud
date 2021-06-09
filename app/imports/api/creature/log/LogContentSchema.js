import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';
import RollDetailsSchema from '/imports/api/properties/subSchemas/RollDetailsSchema.js';

let LogContentSchema = new SimpleSchema({
  // The name of the field, included in discord webhook message
  name: {
    type: String,
    optional: true,
  },
  // The details of the field, included in discord webhook message
  // Markdown support
  value: {
    type: String,
    optional: true,
  },
  context: {
    type: Object,
    optional: true,
  },
  'context.errors':{
    type: Array,
    defaultValue: [],
  },
  'context.errors.$': {
    type: ErrorSchema,
  },
  'context.rolls': {
    type: Array,
    defaultValue: [],
  },
  'context.rolls.$': {
    type: RollDetailsSchema,
  },
  'context.doubleRolls': {
    type: Boolean,
    optional: true,
  },
});

export default LogContentSchema;

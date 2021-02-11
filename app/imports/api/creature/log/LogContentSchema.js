import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';
import RollDetailsSchema from '/imports/api/properties/subSchemas/RollDetailsSchema.js';

let LogContentSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
  },
  error: {
    type: String,
    optional: true,
  },
  resultPrefix: {
    type: String,
    optional: true,
  },
  result: {
    type: String,
    optional: true,
  },
  expandedResult: {
    type: String,
    optional: true,
  },
  details: {
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

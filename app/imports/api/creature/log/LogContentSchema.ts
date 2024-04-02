import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema';
import RollDetailsSchema from '/imports/api/properties/subSchemas/RollDetailsSchema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';

export interface LogContent {
  name?: string
  value?: string
  inline?: boolean
  context?: {
    errors: any[]
    rolls: any[]
    doubleRolls?: boolean
  }
}

let LogContentSchema = new SimpleSchema({
  // The name of the field, included in discord webhook message
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  // The details of the field, included in discord webhook message
  // Markdown support
  value: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.summary,
  },
  // Inline with other content fields
  inline: {
    type: Boolean,
    optional: true,
  },
  // This log entry was silenced
  silenced: {
    type: Boolean,
    optional: true,
  },
  context: {
    type: Object,
    optional: true,
  },
  'context.errors': {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.errorCount,
  },
  'context.errors.$': {
    type: ErrorSchema,
  },
  'context.rolls': {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.rollCount,
  },
  'context.rolls.$': {
    type: RollDetailsSchema,
  },
  'context.doubleRolls': {
    type: Boolean,
    optional: true,
  },
  targetIds: {
    type: Array,
    optional: true,
  },
  'targetIds.$': {
    type: String,
  }
});

export default LogContentSchema;

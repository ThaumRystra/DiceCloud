import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { type InferType, TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

const SharingSchema = TypedSimpleSchema.from({
  owner: {
    type: String,
    max: 32,
  },
  readers: {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.readersCount,
  },
  'readers.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  writers: {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.writersCount,
  },
  'writers.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  public: {
    type: Boolean,
    defaultValue: false,
  },
  readersCanCopy: {
    type: Boolean,
    optional: true,
  },
});

export type Shared = InferType<typeof SharingSchema>;

export default SharingSchema;

import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

export interface Shared {
  owner: string,
  readers: string[],
  writers: string[],
  public: boolean,
  readersCanCopy?: true,
}

const SharingSchema = TypedSimpleSchema.from({
  owner: {
    type: String,
    max: 32,
    index: 1
  },
  readers: {
    type: Array,
    defaultValue: [],
    index: 1,
    maxCount: STORAGE_LIMITS.readersCount,
  },
  'readers.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  writers: {
    type: Array,
    defaultValue: [],
    index: 1,
    maxCount: STORAGE_LIMITS.writersCount,
  },
  'writers.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  public: {
    type: Boolean,
    defaultValue: false,
    index: 1,
  },
  readersCanCopy: {
    type: Boolean,
    optional: true,
  },
});

export default SharingSchema;

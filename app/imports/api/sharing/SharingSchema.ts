import SimpleSchema from 'simpl-schema';
import '/imports/api/sharing/sharing';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';

export interface Shared {
  owner: string,
  readers: string[],
  writers: string[],
  public: boolean,
  readersCanCopy?: true,
}

const SharingSchema = new SimpleSchema({
  owner: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    //@ts-expect-error index not defined
    index: 1
  },
  readers: {
    type: Array,
    defaultValue: [],
    //@ts-expect-error index not defined
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
    //@ts-expect-error index not defined
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
    //@ts-expect-error index not defined
    index: 1,
  },
  readersCanCopy: {
    type: Boolean,
    optional: true,
  },
});

export default SharingSchema;

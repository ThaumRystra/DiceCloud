import SimpleSchema from 'simpl-schema';
import '/imports/api/sharing/sharing.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

let SharingSchema = new SimpleSchema({
  owner: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
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

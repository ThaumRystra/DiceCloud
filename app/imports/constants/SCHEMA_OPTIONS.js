import SimpleSchema from 'simpl-schema';

const SCHEMA_OPTIONS = {
  clean: {
    filter: true,
    autoConvert: true,
    removeEmptyStrings: true,
    trimStrings: false,
    getAutoValues: true,
    removeNullsFromArrays: true,
  },
};

export default SCHEMA_OPTIONS;

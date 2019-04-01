import SimpleSchema from 'simpl-schema';

export default function schema(options){
  return new SimpleSchema(options, {
    clean: {
      filter: true,
      autoConvert: true,
      removeEmptyStrings: true,
      trimStrings: false,
      getAutoValues: true,
      removeNullsFromArrays: true,
    },
  });
}

import SimpleSchema from 'simpl-schema';

function getDefaultSchema(){
  return new SimpleSchema({}, {
    clean: {
      filter: true,
      autoConvert: true,
      removeEmptyStrings: true,
      trimStrings: false,
      getAutoValues: true,
      removeNullsFromArrays: true,
    },
  });
};

export default function schema(options){
  return getDefaultSchema().extend(options);
};

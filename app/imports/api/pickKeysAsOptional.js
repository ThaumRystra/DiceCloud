export default function pickKeysAsOptional(schema, keys){
  let newSchema = schema.pick(...keys);
  let optionalSchema = {};
  for (let i of keys){
    optionalSchema[i] = {optional: true}
  };
  newSchema.extend(optionalSchema);
  return newSchema;
};

import schema from '/imports/api/schema.js';

let getInheritPropertiesSchema = function(keys){
  let options = {
  	'parent.properties': {
      type: Object,
      optional: true,
    },
  };
  for (let key in keys){
    options[`parent.properties.${key}`] = keys[key];
  }
  return schema(options);
};

export default getInheritPropertiesSchema;

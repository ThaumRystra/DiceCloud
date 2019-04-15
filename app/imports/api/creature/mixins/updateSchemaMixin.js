const argumentSchema = new SimpleSchema({
  _id: SimpleSchema.RegEx.Id,
  update: {
    type: Object,
    blackbox: true,
  },
});

// Modified simpleSchemaMixin
import SimpleSchema from 'simpl-schema';

export default function updateSchemaMixin(methodOptions) {
  // If the user didn't give us a schema and they did give us a validate, assume
  // that they are choosing to use the validate way of doing things in this call.
  if ((
    typeof methodOptions.schema === 'undefined' &&
    typeof methodOptions.validate !== 'undefined'
  ) || (
    typeof methodOptions.schema !== 'undefined' &&
    methodOptions.schema === null &&
    typeof methodOptions.validate !== 'undefined' &&
    methodOptions.validate !== null
  )) {
    return methodOptions;
  }

  // If they truly gave us both... that just doesn't seem proper.
  if (methodOptions.validate && methodOptions.validate !== null) {
    throw new Meteor.Error(
      'simpleSchemaMixin.options',
      '"schema" and "validate" options cannot be used together');
  }

  // Note that setting them both null will make it through, defaulting to the
  // schema = null behavior (enforce no args) instead of the validate = null
  // behavior (do no validation).

  // Apply default validator options if none are provided
  methodOptions.schemaValidatorOptions =
    methodOptions.schemaValidatorOptions ||
    { clean: true, modifier: true };

  // Make the update schema a SimpleSchema, if it isn't already
  let updateSchema;
  if (methodOptions.schema instanceof SimpleSchema) {
    updateSchema = methodOptions.schema;
  } else {
    updateSchema = new SimpleSchema(methodOptions.schema);
  }

  // Set up the new validation
  methodOptions.validate = function(args){
    argumentSchema.validate(args);
    updateSchema.validate(
      {$set: args.update},
      methodOptions.schemaValidatorOptions
    );
  };

  // Give a default run function if one isn't supplied
  if (!methodOptions.run){
    methodOptions.run = function({_id, update}){
      return methodOptions.collection.update(_id, {$set: update});
    };
  }
  return methodOptions;
}

import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';

if (Meteor.isDevelopment){
  SimpleSchema.debug = true
}

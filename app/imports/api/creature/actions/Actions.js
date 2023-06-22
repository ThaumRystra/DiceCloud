import SimpleSchema from 'simpl-schema';

// Actions are creature actions that have been partially executed and not yet resolved
// They require some user input to progress
let Actions = new Mongo.Collection('actions');

let CreaturePropertySchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  // Which creature is taking the action
  _creatureId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  // The user who began taking the action
  user: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  // The property that is about to be applied
  property: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
});

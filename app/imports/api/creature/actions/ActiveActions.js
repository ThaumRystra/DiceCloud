import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';

// Actions are creature actions that have been partially executed and not yet resolved
// They require some user input to progress
let ActiveActions = new Mongo.Collection('activeActions');

let ActiveActionSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  // Which creature is taking the action
  creatureId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  // The user who began taking the action
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  // Requests for user input
  questions: {
    type: Object,
    blackbox: true,
    optional: true,
  },
  // User responses
  answers: {
    type: Object,
    blackbox: true,
    optional: true,
  },
});

ActiveActions.attachSchema(ActiveActionSchema);

export default ActiveActions;

export const answerAction = new ValidatedMethod({
  name: 'activeActions.answer',
  validate: null /*new SimpleSchema({
    activeActionId: SimpleSchema.RegEx.Id,
    answers: {
      type: Object,
      blackbox: true,
    },
  }).validator()*/,
  applyOptions: {
    throwStubExceptions: false,
  },
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ activeActionId, answers }) {
    return ActiveActions.update({}, {
      $set: { answers },
      $unset: { questions: 1 },
    });
    const action = ActiveActions.findOne(activeActionId);
    // Permissions
    if (action.userId !== this.userId) {
      throw new Meteor.Error('Permission denied', 'You do not own this action');
    }
    return ActiveActions.update(activeActionId, {
      $set: { answers },
      $unset: { questions: 1 },
    });
  },
});

export const removeAction = new ValidatedMethod({
  name: 'activeActions.remove',
  validate: new SimpleSchema({
    activeActionId: SimpleSchema.RegEx.Id,
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ activeActionId }) {
    const action = ActiveActions.findOne(activeActionId);
    // Permissions
    if (action.userId !== this.userId) {
      throw new Meteor.Error('Permission denied', 'You do not own this action');
    }
    return ActiveActions.remove(activeActionId);
  },
});

// TODO remove this
export const removeAllActions = new ValidatedMethod({
  name: 'activeActions.removeAll',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run() {
    return ActiveActions.remove({});
  },
});

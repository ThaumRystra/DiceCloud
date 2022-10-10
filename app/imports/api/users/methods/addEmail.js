import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';

const addEmail = new ValidatedMethod({
  name: 'users.addEmail',
  validate: new SimpleSchema({
    email: {
      type: String,
      regEx: SimpleSchema.RegEx.Email,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 1,
    timeInterval: 5000,
  },
  run({ email }) {
    const userId = Meteor.userId();
    const user = Meteor.users.findOne(userId);
    if (!user) throw new Meteor.Error('No user',
      'You must be logged in to add an email address');
    if (user.emails && user.emails.length >= 2) {
      throw new Meteor.Error('Emails full',
        'You may only have up to 2 email addresses per account');
    }
    if (Meteor.isServer) {
      Accounts.addEmail(userId, email);
      Accounts.sendVerificationEmail(userId, email);
    }
  }
});

export default addEmail;

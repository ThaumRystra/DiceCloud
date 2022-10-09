import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';

const removeEmail = new ValidatedMethod({
  name: 'users.removeEmail',
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
      'You must be logged in to remove an email address');
    if (!user.emails) {
      throw new Meteor.Error('No email to remove',
        'No email addresses are associated with this account');
    }
    if (user.emails.length == 1) {
      throw new Meteor.Error('Can\'t remove last email',
        'You may not remove the last email address from your account');
    }
    if (Meteor.isServer) {
      Accounts.removeEmail(userId, email);
    }
  }
});

export default removeEmail;

import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import { assertAdmin } from '/imports/api/sharing/sharingPermissions';
import { Migrations } from 'meteor/percolate:migrations';

const migrateTo = new ValidatedMethod({
  name: 'admin.migrateTo',
  validate: new SimpleSchema({
    version: {
      type: SimpleSchema.oneOf(
        SimpleSchema.Integer,
        String
      ),
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 1,
    timeInterval: 10000,
  },
  run({ version }) {
    if (Meteor.isClient) return;
    assertAdmin(this.userId);
    Migrations.migrateTo(version);
  },
});

export default migrateTo;

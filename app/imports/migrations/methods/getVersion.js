import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertAdmin } from '/imports/api/sharing/sharingPermissions';
import { Migrations } from 'meteor/percolate:migrations';

const dbVersionToGitVersion = {
  0: '2.0-beta.32 and lower',
  1: '2.0-beta.33',
}

const getVersion = new ValidatedMethod({
  name: 'admin.getVersion',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run() {
    if (Meteor.isClient) return;
    assertAdmin(this.userId);
    const dbVersion = Migrations.getVersion();
    return {
      dbVersion,
      gitVersion: dbVersionToGitVersion[dbVersion],
    }
  },
});

export default getVersion;

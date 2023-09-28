import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertAdmin } from '/imports/api/sharing/sharingPermissions';

const validateDatabase = new ValidatedMethod({
  name: 'validateDatabase',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 1,
    timeInterval: 10000,
  },
  run() {
    assertAdmin(this.userId);
    // Very computationally expensive data diagnostics
    // Only run in an offline instance you control
    return;
    if (Meteor.isClient) return;

    Meteor.Collection.getAll().forEach(collection => {
      if (!collection.instance._c2?._simpleSchemas) return;
      collection.instance.find({}).forEach(doc => {
        const schema = collection.instance.simpleSchema(doc);
        let cleanDoc = schema.clean(doc);
        try {
          schema.validate(cleanDoc, { modifier: false });
        } catch (e) {
          console.log(collection.name, doc._id, e.message || e.reason || e.toString());
        }
      });
    });
  },
});

export default validateDatabase;

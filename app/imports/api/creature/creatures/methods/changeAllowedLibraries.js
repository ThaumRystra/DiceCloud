import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Creatures from '/imports/api/creature/creatures/Creatures';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import SimpleSchema from 'simpl-schema';
import simpleSchemaMixin from '/imports/api/creature/mixins/simpleSchemaMixin';

const changeAllowedLibraries = new ValidatedMethod({
  name: 'creatures.changeAllowedLibraries',
  mixins: [RateLimiterMixin, simpleSchemaMixin],
  schema: new SimpleSchema({
    _id: {
      type: String,
      max: 32,
    },
    allowedLibraries: {
      type: Array,
      optional: true,
      maxCount: 100,
    },
    'allowedLibraries.$': {
      type: String,
      max: 32,
    },
    allowedLibraryCollections: {
      type: Array,
      optional: true,
      maxCount: 100,
    },
    'allowedLibraryCollections.$': {
      type: String,
      max: 32,
    },
  }),
  rateLimit: {
    numRequests: 10,
    timeInterval: 5000,
  },
  run({ _id, allowedLibraries, allowedLibraryCollections }) {
    let creature = Creatures.findOne(_id);
    assertEditPermission(creature, this.userId);
    let $set;
    if (allowedLibraries) {
      $set = { allowedLibraries }
    }
    if (allowedLibraryCollections) {
      if (!$set) $set = {};
      $set.allowedLibraryCollections = allowedLibraryCollections;
    }
    if (!$set) return;
    Creatures.update(_id, { $set });
  },
});

const toggleAllUserLibraries = new ValidatedMethod({
  name: 'creatures.removeLibraryLimits',
  mixins: [RateLimiterMixin, simpleSchemaMixin],
  schema: new SimpleSchema({
    _id: {
      type: String,
      max: 32,
    },
    value: {
      type: Boolean,
    },
  }),
  rateLimit: {
    numRequests: 10,
    timeInterval: 5000,
  },
  run({ _id, value }) {
    if (value) {
      Creatures.update(_id, {
        $unset: {
          allowedLibraryCollections: 1,
          allowedLibraries: 1,
        },
      });
    } else {
      Creatures.update(_id, {
        $set: {
          allowedLibraryCollections: [],
          allowedLibraries: [],
        },
      });
    }
  },
});

export { changeAllowedLibraries, toggleAllUserLibraries };

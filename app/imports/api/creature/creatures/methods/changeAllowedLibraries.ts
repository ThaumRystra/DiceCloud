import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Creatures, { type Creature } from '/imports/api/creature/creatures/Creatures';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

const changeAllowedLibraries = new ValidatedMethod({
  name: 'creatures.changeAllowedLibraries',
  mixins: [RateLimiterMixin],
  validate: TypedSimpleSchema.from({
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
  }).validator(),
  rateLimit: {
    numRequests: 10,
    timeInterval: 5000,
  },
  async run({ _id, allowedLibraries, allowedLibraryCollections }) {
    const creature = await Creatures.findOneAsync(_id);
    await assertEditPermission(creature, this.userId);
    const modifier: Mongo.Modifier<Creature> = { $set: undefined };
    if (allowedLibraries) {
      modifier.$set = { allowedLibraries }
    }
    if (allowedLibraryCollections) {
      if (!modifier.$set) modifier.$set = {};
      modifier.$set.allowedLibraryCollections = allowedLibraryCollections;
    }
    if (!modifier.$set) return;
    await Creatures.updateAsync(_id, modifier);
  },
});

const toggleAllUserLibraries = new ValidatedMethod({
  name: 'creatures.removeLibraryLimits',
  mixins: [RateLimiterMixin],
  validate: TypedSimpleSchema.from({
    _id: {
      type: String,
      max: 32,
    },
    value: {
      type: Boolean,
    },
  }).validator(),
  rateLimit: {
    numRequests: 10,
    timeInterval: 5000,
  },
  async run({ _id, value }) {
    if (value) {
      await Creatures.updateAsync(_id, {
        $unset: {
          allowedLibraryCollections: 1,
          allowedLibraries: 1,
        },
      });
    } else {
      await Creatures.updateAsync(_id, {
        $set: {
          allowedLibraryCollections: [],
          allowedLibraries: [],
        },
      });
    }
  },
});

export { changeAllowedLibraries, toggleAllUserLibraries };

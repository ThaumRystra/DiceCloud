import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertAdmin } from '/imports/api/sharing/sharingPermissions';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { InferType, TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';
import { Mongo } from 'meteor/mongo';

const iconsSchema = TypedSimpleSchema.from({
  name: {
    type: String,
    max: STORAGE_LIMITS.name,
  },
  description: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.description,
  },
  tags: {
    type: Array,
    optional: true,
    maxCount: STORAGE_LIMITS.tagCount,
  },
  'tags.$': {
    type: String,
    max: STORAGE_LIMITS.tagLength,
  },
  shape: {
    type: String,
    max: STORAGE_LIMITS.icon,
  },
});

type Icon = InferType<typeof iconsSchema>;

const Icons = new Mongo.Collection<Icon>('icons');
Icons.attachSchema(iconsSchema);

if (Meteor.isServer) {
  await Icons.createIndexAsync({
    'name': 'text',
    'description': 'text',
    'tags': 'text',
  });
}

const storedIconsSchema = TypedSimpleSchema.from({
  name: {
    type: String,
  },
  shape: {
    type: String,
  },
});

// This method does not validate icons against the schema, use wisely;
const writeIcons = new ValidatedMethod({
  name: 'icons.write',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 20,
    timeInterval: 10000,
  },
  async run(icons) {
    await assertAdmin(this.userId);
    if (Meteor.isServer) {
      this.unblock();
      await Icons.rawCollection().insertMany(icons, { ordered: false });
    }
  }
});

const findIcons = new ValidatedMethod({
  name: 'icons.find',
  validate: new SimpleSchema({
    search: {
      type: String,
      max: 30,
      optional: true,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 20,
    timeInterval: 10000,
  },
  async run({ search }) {
    if (!search) return [];
    if (!Meteor.isServer) return;
    return Icons.find(
      { $text: { $search: search } },
      {
        // relevant documents have a higher score.
        fields: {
          // @ts-expect-error don't have types for meta text scoring
          score: { $meta: 'textScore' }
        },
        // `score` property specified in the projection fields above.
        sort: {
          score: { $meta: 'textScore' }
        }
      }
    ).fetchAsync();
  }
})

export { writeIcons, findIcons, storedIconsSchema };
export default Icons;

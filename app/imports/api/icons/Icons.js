import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertAdmin } from '/imports/api/sharing/sharingPermissions.js';

let Icons = new Mongo.Collection('icons');

let iconsSchema = new SimpleSchema({
	name: {
		type: String,
    unique: true,
    index: 1,
	},
	description: {
		type: String,
		optional: true,
	},
  tags: {
    type: Array,
    optional: true,
    index: 1,
  },
  'tags.$': {
    type: String,
  },
  shape: {
    type: String,
  },
});

if (Meteor.isServer) {
  Icons._ensureIndex({
    'name': 'text',
    'description': 'text',
		'tags': 'text',
  });
}

const storedIconsSchema = new SimpleSchema({
  name: {
    type: String,
  },
  shape: {
    type: String,
  },
});

Icons.attachSchema(iconsSchema);

// This method does not validate icons against the schema, use wisely;
const writeIcons = new ValidatedMethod({
	name: 'icons.write',
	validate: null,
	run(icons){
    assertAdmin(this.userId);
    if (Meteor.isServer){
      this.unblock();
      Icons.rawCollection().insert(icons, {ordered: false});
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
  run({search}){
    if (!search) return [];
    if (!Meteor.isServer) return;
    return Icons.find(
      { $text: {$search: search} },
      {
        // relevant documents have a higher score.
        fields: {
          score: { $meta: 'textScore' }
        },
        // `score` property specified in the projection fields above.
        sort: {
          score: { $meta: 'textScore' }
        }
      }
    ).fetch();
  }
})

export { writeIcons, findIcons, storedIconsSchema };
export default Icons;

import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';

let Icons = new Mongo.Collection('icons');

iconsSchema = schema({
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

Icons.attachSchema(iconsSchema);

/*
console.warn("Write Icons is not secure, disable before deployment")
const writeIcons = new ValidatedMethod({
	name: 'writeIcons',
	validate: null,
	run(icons){
    if (Meteor.isServer){
      this.unblock();
      Icons.rawCollection().insert(icons, {ordered: false});
    }
	}
});
*/

export { writeIcons };
export default Icons;

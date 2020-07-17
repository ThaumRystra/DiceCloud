import SimpleSchema from 'simpl-schema';

let Parties = new Mongo.Collection('parties');

let partySchema = new SimpleSchema({
	name: {
		type: String,
		defaultValue: 'New Party',
		trim: false,
		optional: true,
	},
	creatures: {
		type: Array,
		defaultValue: [],
	},
	'creatures.$': {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
	},
	owner: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
	},
});

Parties.attachSchema(partySchema);

export default Parties;

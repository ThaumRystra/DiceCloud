import SimpleSchema from 'simpl-schema';

let NoteSchema = new SimpleSchema({
	name: {
		type: String,
		optional: true,
	},
	description: {
		type: String,
		optional: true,
	},
});

export { NoteSchema };

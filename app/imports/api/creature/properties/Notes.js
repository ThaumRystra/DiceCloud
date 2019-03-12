import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';

let Notes = new Mongo.Collection("notes");

let NoteSchema = schema({
	name: {
		type: String,
		optional: true,
	},
	description: {
		type: String,
		optional: true,
	},
});

NoteSchema.extend(ColorSchema);

Notes.attachSchema(NoteSchema);
Notes.attachSchema(PropertySchema);

export default Notes;
export { NoteSchema };

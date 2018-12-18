import SimpleSchema from 'simpl-schema';
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";

let Notes = new Mongo.Collection("notes");

noteSchema = new SimpleSchema({
	charId:      {type: String, regEx: SimpleSchema.RegEx.Id, index: 1},
	name:		 {type: String, optional: true, trim: false},
	description: {type: String, optional: true, trim: false},
});

Notes.attachSchema(noteSchema);
Notes.attachSchema(ColorSchema);

//Notes.attachBehaviour("softRemovable");

export default Notes;

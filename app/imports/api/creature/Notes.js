Notes = new Mongo.Collection("notes");
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";

Schemas.Note = new SimpleSchema({
	charId:      {type: String, regEx: SimpleSchema.RegEx.Id, index: 1},
	name:		 {type: String, optional: true, trim: false},
	description: {type: String, optional: true, trim: false},
});

Notes.attachSchema(Schemas.Note);
Attributes.attachSchema(ColorSchema);

Notes.attachBehaviour("softRemovable");

Notes.allow(CHARACTER_SUBSCHEMA_ALLOW);
Notes.deny(CHARACTER_SUBSCHEMA_DENY);

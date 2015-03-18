Notes = new Mongo.Collection("notes");

Schemas.Note = new SimpleSchema({
	charId:      {type: String, regEx: SimpleSchema.RegEx.Id},
	name:		 {type: String, trim: false},
	description: {type: String, optional: true, trim: false},
	color:   {type: String, allowedValues: _.pluck(colorOptions, "key"), defaultValue: "q"}
});

Notes.attachSchema(Schemas.Note);

Notes.allow(CHARACTER_SUBSCHEMA_ALLOW);
Notes.deny(CHARACTER_SUBSCHEMA_DENY);

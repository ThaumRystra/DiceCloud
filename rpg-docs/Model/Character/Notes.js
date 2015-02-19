Notes = new Meteor.Collection("notes");

Schemas.Note = new SimpleSchema({
	charId:      {type: String, regEx: SimpleSchema.RegEx.Id},
	name:		 {type: String},
	description: {type: String, optional: true},
	color:   {type: String, allowedValues: _.pluck(colorOptions, "key"), defaultValue: "q"}
});

Notes.attachSchema(Schemas.Note);

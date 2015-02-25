Levels = new Meteor.Collection("levels");

Schemas.Level = new SimpleSchema({
	charId:      {type: String, regEx: SimpleSchema.RegEx.Id},
	classId:     {type: String, regEx: SimpleSchema.RegEx.Id},
	value:		 {type: Number}
});

Levels.attachSchema(Schemas.Level);

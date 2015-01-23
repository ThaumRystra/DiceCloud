Features = new Meteor.Collection("features");

Schemas.Feature = new SimpleSchema({
	charId:		{type: String, regEx: SimpleSchema.RegEx.Id},
	name:       {type: String},
	description:{type: String, optional: true},
	actions:    {type: [Schemas.Action], defaultValue: []},
	attacks:	{type: [Schemas.Attack], defaultValue: []},
	spells:		{type: [Schemas.Spell] , defaultValue: []},
});

Features.attachSchema(Schemas.Feature);

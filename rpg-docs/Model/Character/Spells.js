Spells = new Meteor.Collection("spells");

Schemas.Spell = new SimpleSchema({
	charId:      {type: String, regEx: SimpleSchema.RegEx.Id},
	listId:      {type: String, regEx: SimpleSchema.RegEx.Id},
	prepared:    {type: String, defaultValue: "unprepared", allowedValues: ["prepared","unprepared","always"]},
	name:		 {type: String},
	description: {type: String, optional: true},
	castingTime: {type: String, optional: true, defaultValue: "action"},
	range:		 {type: String, optional: true},
	duration:	 {type: String, optional: true},
	"components.verbal":		{type: Boolean, defaultValue: false},
	"components.somatic":		{type: Boolean, defaultValue: false},
	"components.material":		{type: String, optional: true},
	"components.concentration":	{type: Boolean, defaultValue: false},
	ritual:		 {type: Boolean, defaultValue: false},
	level:		 {type: Number, defaultValue: 0},
	school:      {type: String, defaultValue: "Abjuration", allowedValues: magicSchools},
	color:   {type: String, allowedValues: _.pluck(colorOptions, "key"), defaultValue: "q"}
});

Spells.attachSchema(Schemas.Spell);

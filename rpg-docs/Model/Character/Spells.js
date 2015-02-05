Spells = new Meteor.Collection("spells");

Schemas.Spell = new SimpleSchema({
	charId:      {type: String, regEx: SimpleSchema.RegEx.Id},
	listId:      {type: String, regEx: SimpleSchema.RegEx.Id},
	prepared:    {type: Boolean, defaultValue: false},
	prepareCost: {type: Number, defaultValue: 1}, //0 for spells that "dont count against your max number of spells prepared", 1 otherwise
	name:		 {type: String},
	description: {type: String, optional: true},
	castingTime: {type: String, optional: true},
	range:		 {type: String, optional: true},
	duration:	 {type: String, optional: true},
	"components.verbal":		{type: Boolean, defaultValue: false},
	"components.somatic":		{type: Boolean, defaultValue: false},
	"components.material":		{type: String, optional: true},
	"components.concentration":	{type: Boolean, defaultValue: false},
	ritual:		 {type: Boolean, defaultValue: false},
	level:		 {type: Number, defaultValue: 0}
});

Spells.attachSchema(Schemas.Spell);

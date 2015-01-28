Spells = new Meteor.Collection("spells");

Schemas.Spell = new SimpleSchema({
	charId: {type: String, regEx: SimpleSchema.RegEx.Id},
	name:		{type: String},
	description:{type: String},
	castingTime:{type: String},
	range:		{type: String},
	duration:	{type: Number},
	"components.verbal":		{type: Boolean},
	"components.somatic":		{type: Boolean},
	"components.material":		{type: String, optional: true},
	"components.concentration":	{type: Boolean},
	ritual:		{type: Boolean},
	selfBuffs:	{type: [Schemas.Buff], defaultValue: []},
	level:		{type: Number},
	class:		{type: String}
});

Spells.attachSchema(Schemas.Spell);

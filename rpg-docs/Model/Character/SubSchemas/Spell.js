Schemas.Spell = new SimpleSchema({
	_id: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		autoValue: function(){
			if(!isSet) return Random.id();
		}
	},
	name:		{type: String},
	description:{type: String},
	castingTime:{type: String},
	range:		{type: String},
	duration:	{type: Number},
	"components.verbal":		{type: Boolean},
	"components.somatic":		{type: Boolean},
	"components.material":		{type: String},
	"components.concentration":	{type: Boolean},
	buffs: 		{type: [Schemas.Buff], optional: true},
	level:		{type: Number},
});
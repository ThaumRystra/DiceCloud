Schemas.Feature = new SimpleSchema({
	_id:		{type: String, regEx: SimpleSchema.RegEx.Id},
	character:	{type: String, regEx: SimpleSchema.RegEx.Id},
	name:		{type: String},
	description:{type: String},
	buffs: 		{type: [Schemas.Buff], optional: true},
	enabled: 	{type: Boolean},
	expires:	{type: Number, optional: true},
	duration:	{type: Number, optional: true},
	uses:		{type: Number, min: 0, optional: true},
})
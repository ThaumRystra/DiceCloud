//buffs are temporary once applied and store things which expire and their expiry time
Schemas.Buff = new SimpleSchema({
	//buff id
	_id: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		autoValue: function(){
			if(!this.isSet) return Random.id();
		}},
	
	//things that expire
	effects: 	{ type: [Schemas.Effect], defaultValue: [] },
	actions:	{ type: [Schemas.Action], defaultValue: [] },
	
	//expiry time
	expiry:     { type: Number, optional: true},
	duration:	{ type: Number }
});

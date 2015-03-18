Buffs = new Mongo.Collection("buffs");

//buffs are temporary once applied and store things which expire and their expiry time
Schemas.Buff = new SimpleSchema({
	//buff id
	_id: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		autoValue: function(){
			if(!this.isSet) return Random.id();
		}},
	charId: {
		type: String, 
		regEx: SimpleSchema.RegEx.Id
	},
	//expiry time
	expiry:     { type: Number, optional: true},
	duration:	{ type: Number }
});

Buffs.attachSchema(Schemas.Buff);

Buffs.attachBehaviour('softRemovable');
makeParent(Buffs, 'name'); //parents of effects and attacks

Buffs.allow(CHARACTER_SUBSCHEMA_ALLOW);
Buffs.deny(CHARACTER_SUBSCHEMA_DENY);

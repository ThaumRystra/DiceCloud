Items = new Mongo.Collection('items');

Schemas.Item = new SimpleSchema({
	name: 		{type: String, defaultValue: "New Item", trim: false},
	plural:		{type: String, optional: true, trim: false},
	description:{type: String, optional: true, trim: false},
	container:	{type: String, regEx: SimpleSchema.RegEx.Id}, //id of container it is normally stowed in
	charId:     {type: String, regEx: SimpleSchema.RegEx.Id}, //id of owner
	quantity:	{type: Number, min: 0, defaultValue: 1},
	weight:		{type: Number, min: 0, defaultValue: 0, decimal: true},
	value:		{type: Number, min: 0, defaultValue: 0, decimal: true},
	equipmentSlot:	{
		type: String, 
		defaultValue: "none", 
		allowedValues: ["none", "head", "armor", "arms", "hands", "held", "feet"]
	},
	equipped: 	{type: Boolean, defaultValue: false},
	color:   {type: String, allowedValues: _.pluck(colorOptions, "key"), defaultValue: "q"}
});

Items.attachSchema(Schemas.Item);

Items.helpers({
	totalValue: function(){
		return this.value * this.quantity;
	},
	totalWeight: function(){
		return this.weight * this.quantity;
	},
	pluralName: function(){
		if(this.plural && this.quantity !== 1){
			return this.plural;
		} else{
			return this.name;
		}
	}
});

//remove effects and attacks if their item source is removed
Items.before.remove(function (userId, item) {
	Effects.find({sourceId: item._id, type: "equipment"}).forEach(function(effect){
		Effects.remove(effect._id);
	});
	Attacks.find({sourceId: item._id, type: "equipment"}).forEach(function(attack){
		Attacks.remove(attack._id);
	});
});

//keep the effects and attacks on the correct character and enabled when equipped
Items.after.update(function (userId, item, fieldNames, modifier, options) {
	Effects.find({sourceId: item._id, type: "equipment"}).forEach(function(effect){
		Effects.update(effect._id, { $set: {charId: item.charId, enabled: item.equipped, name: item.name} });
	});
	Attacks.find({sourceId: item._id, type: "equipment"}).forEach(function(attack){
		Attacks.update(attack._id, { $set: {charId: item.charId, enabled: item.equipped, name: item.name} });
	});
}, {fetchPrevious: false});

Items.allow(CHARACTER_SUBSCHEMA_ALLOW);

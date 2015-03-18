Items = new Mongo.Collection('items');

Schemas.Item = new SimpleSchema({
	name: 		{type: String, defaultValue: "New Item", trim: false},
	plural:		{type: String, optional: true, trim: false},
	description:{type: String, optional: true, trim: false},
	charId:     {type: String, regEx: SimpleSchema.RegEx.Id}, //id of owner
	quantity:	{type: Number, min: 0, defaultValue: 1},
	weight:		{type: Number, min: 0, defaultValue: 0, decimal: true},
	value:		{type: Number, min: 0, defaultValue: 0, decimal: true},
	equipmentSlot:	{
		type: String, 
		defaultValue: "none", 
		allowedValues: ["none", "head", "armor", "arms", "hands", "held", "feet"]
	},
	enabled:    {type: Boolean, defaultValue: false},
	color:      {type: String, allowedValues: _.pluck(colorOptions, "key"), defaultValue: "q"}
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

Items.attachBehaviour('softRemovable');
makeChild(Items); //children of containers
makeParent(Items); //parents of effects and attacks

Items.allow(CHARACTER_SUBSCHEMA_ALLOW);

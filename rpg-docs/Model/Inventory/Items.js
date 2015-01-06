Items = new Meteor.Collection('items');

Schemas.Item = new SimpleSchema({
	name: 		{type: String, defaultValue: "New Item"},
	plural:		{type: String, optional: true},
	description:{type: String, defaultValue: ""},
	container:	{type: String}, //id of container it normally is stowed in
	character:	{type: String, regEx: SimpleSchema.RegEx.Id}, //id of owner
	quantity:	{type: Number, min: 0, defaultValue: 1},
	weight:		{type: Number, min: 0, defaultValue: 0, decimal: true},
	value:		{type: Number, min: 0, defaultValue: 0, decimal: true},
	tradeGood:	{type: Boolean, defaultValue: false},
	stackable:	{type: Boolean, defaultValue: false},
	feature:	{type: Schemas.Feature},
	equipmentSlot:	{
		type: String, 
		defaultValue: "none", 
		allowedValues: ["none", "head", "armor", "arms", "hands", "held", "feet"]
	},
	equipped: 	{type: Boolean, defaultValue: false}
});

Items.attachSchema(Schemas.Item);

//update the features of the items as needed
Items.find({}, {fields: {feature: 1, character: 1, equipped: 1}}).observe({
	added: function(newItem){
		if(newItem.feature && newItem.character)
			addFeatureEffects(newItem.character, newItem.feature);
	},
	changed: function(newItem, oldItem){
		if(oldItem.feature && oldItem.character)
			removeFeatureEffects(oldItem.character, oldItem.feature);
		if(newItem.feature && newItem.character)
			addFeatureEffects(newItem.character, newItem.feature);
	},
	removed: function(oldItem){
		if(oldItem.feature && oldItem.character)
			removeFeatureEffects(oldItem.character, oldItem.feature);
	}
});

Items.helpers({
	totalValue: function(){
		return this.value * this.quantity;
	},
	totalWeight: function(){
		return this.weight * this.quantity;
	},
	pluralName: function(){
		if(this.stackable && this.plural && this.quantity > 1){
			return this.plural;
		} else{
			return this.name;
		}
	}
});
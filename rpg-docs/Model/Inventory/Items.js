Items = new Meteor.Collection('items');

Schemas.Item = new SimpleSchema({
	name: 		{type: String, defaultValue: "New Item"},
	plural:		{type: String, optional: true},
	description:{type: String, defaultValue: ""},
	container:	{type: String, regEx: SimpleSchema.RegEx.Id, optional: true}, //id of container it normally is stowed in
	charId:     {type: String, regEx: SimpleSchema.RegEx.Id, optional: true}, //id of owner
	quantity:	{type: Number, min: 0, defaultValue: 1},
	weight:		{type: Number, min: 0, defaultValue: 0, decimal: true},
	value:		{type: Number, min: 0, defaultValue: 0, decimal: true},
	tradeGood:	{type: Boolean, defaultValue: false},
	stackable:	{type: Boolean, defaultValue: false},
	feature:	{type: Schemas.Feature},
	"feature.name": {type: String, autoValue: function(){return this.field("name").value}},
	"feature.description": {type: String, autoValue: function(){return this.field("description").value}},
	"feature.source": {type: String, autoValue: function(){return this.field("name").value}},
	"feature.effects.$.name": {type: String, autoValue: function(){return this.field("name").value}},
	"feature.effects.$.type": {type: String, autoValue: function(){return "equipment"}},
	"feature.attacks.$.name": {type: String, autoValue: function(){return this.field("name").value}},
	equipmentSlot:	{
		type: String, 
		defaultValue: "none", 
		allowedValues: ["none", "head", "armor", "arms", "hands", "held", "feet"]
	},
	equipped: 	{type: Boolean, defaultValue: false}
});

Items.attachSchema(Schemas.Item);

//update the features of the items as needed
Items.find({}, {fields: {feature: 1, charId: 1, equipped: 1}}).observe({
	added: function(newItem){
		if(newItem.feature && newItem.charId)
			addFeatureEffects(newItem.charId, newItem.feature);
	},
	changed: function(newItem, oldItem){
		if(oldItem.feature && oldItem.charId)
			removeFeatureEffects(oldItem.charId, oldItem.feature);
		if(newItem.feature && newItem.charId)
			addFeatureEffects(newItem.charId, newItem.feature);
	},
	removed: function(oldItem){
		if(oldItem.feature && oldItem.charId)
			removeFeatureEffects(oldItem.charId, oldItem.feature);
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
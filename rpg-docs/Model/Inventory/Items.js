Items = new Meteor.Collection('items');

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

//keep effects sycned with items
//if an item's equipped state changes, update related effects' enabled state
Items.find({}, {fields: {equipped: 1}}).observeChanges({
	added: function(id, fields){
		Effects.find({ type: "equipment", sourceId: id, enabled: {$ne: fields.equipped} },
					 {fields: {enabled: 1} }).forEach(function(effect){
			Effects.update(effect._id, {$set: {enabled: fields.equipped}})
		});
	},
	changed: function(id, fields){
		Effects.find({type: "equipment", sourceId: id, enabled: {$ne: fields.equipped} }, 
					 {fields: {enabled: 1} }).forEach(function(effect){
			Effects.update(effect._id, {$set: {enabled: fields.equipped}})
		});
	}
});

//if an effect's type, source or enabled state change, keep the enabled state up to date with the item's equipped state
Effects.find({type: "equipment"}, {fields: {type: 1, enabled: 1, sourceId: 1}}).observe({
	added: function(newEffect){
		var item = Items.findOne(newEffect.sourceId, {fields: {equipped: 1}});
		if(item && item.equipped !== newEffect.enabled){
			Effects.update(newEffect._id, {$set: {enabled: item.equipped}})
		}
	},
	changed: function(newEffect, oldEffect){
		var item = Items.findOne(newEffect.sourceId, {fields: {equipped: 1}});
		if(item && item.equipped !== newEffect.enabled){
			Effects.update(newEffect._id, {$set: {enabled: item.equipped}})
		}
	}
})

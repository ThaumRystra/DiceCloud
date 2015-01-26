Items = new Meteor.Collection('items');

Schemas.Item = new SimpleSchema({
	name: 		{type: String, defaultValue: "New Item"},
	plural:		{type: String, optional: true},
	description:{type: String, defaultValue: ""},
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
	equipped: 	{type: Boolean, defaultValue: false}
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
		if(this.plural && this.quantity > 1){
			return this.plural;
		} else{
			return this.name;
		}
	}
});

//keep effects sycned with items
Items.find({}, {fields: {equipped: 1}}).observeChanges({
	added: function(id, fields){
		Effects.find({type: "equipment", sourceId: id}, {fields: {enabled: 1} }).forEach(function(effect){
			if(fields.equipped !== effect.enabled){
				Effects.update(effect._id, {$set: {enabled: fields.equipped}})
			}
		});
	},
	changed: function(id, fields){
		Effects.find({type: "equipment", sourceId: id}, {fields: {enabled: 1} }).forEach(function(effect){
			if(fields.equipped !== effect.enabled){
				Effects.update(effect._id, {$set: {enabled: fields.equipped}})
			}
		});
	},
	removed: function(id){
		Effects.find({type: "equipment", sourceId: id}, {fields: {_id: 1} }).forEach(function(effect){
			Effects.remove(effect._id);
		});
	}
});

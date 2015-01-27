//set up the collection for containers
Containers = new Meteor.Collection("containers");


Schemas.Container = new SimpleSchema({
	name: 		{ type: String },
	charId: 	{ type: String, regEx: SimpleSchema.RegEx.Id},
	isCarried: 	{ type: Boolean },
	weight:		{type: Number, min: 0, defaultValue: 0, decimal: true},
	value:		{type: Number, min: 0, defaultValue: 0, decimal: true},
	description:{type: String, optional: true}
});

Containers.attachSchema(Schemas.Container);

Containers.helpers({
	totalValue: function(){
		var value = this.value;
		Items.find({container: this._id, equipped: false}, {fields: {quantity: 1, value: 1}}).forEach(function(item){
			value += item.totalValue();
		});
		return value;
	},
	totalWeight: function(){
		var weight = this.weight;
		Items.find({container: this._id, equipped: false}, {fields: {weight: 1, value: 1}}).forEach(function(item){
			weight += item.totalWeight();
		});
		return weight;
	}
});

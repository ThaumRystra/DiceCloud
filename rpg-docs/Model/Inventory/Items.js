Items = new Meteor.Collection('items');

Schemas.Item = new SimpleSchema({
	name: 		{type: String},
	description:{type: String},
	container:	{type: String, regEx: SimpleSchema.RegEx.Id},
	quantity:	{type: Number, min: 0, defaultValue: 1},
	weight:		{type: Number, min: 0, defaultValue: 0, decimal: true},
	value:		{type: Number, min: 0, defaultValue: 0, decimal: true},
	tradeGood:	{type: Boolean, defaultValue: false},
	stackable:	{type: Boolean, defaultValue: false},
	buffs:		{type: [Schemas.Buff]}
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
		if(this.stackable && this.plural && this.quantity > 1){
			return this.plural;
		} else{
			return this.name;
		}
	}
});
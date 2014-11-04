Items = new Meteor.Collection('items');

Item = function(name, container){
	this.name = name;
	this.container = container;
	this.quantity = 1;
	this.weight = 0.0;
	this.value = 0;//value in gold pieces
	this.description = "";
	this.effects = [];
}
Containers = new Meteor.Collection('containers');

Container = function(name, owner){
	this.name = name;
	this.owner = owner;
	this.isCarried = true;
}
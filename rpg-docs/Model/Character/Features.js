Features = new Meteor.Collection("features");

Feature = function(characterId){
	this.character = characterId;
	this.name = "New Feature";
	this.description = "";
	this.effects = [];
	this.enabled = false;
}
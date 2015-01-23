Meteor.publish("singleCharacter", function(characterId, userId){
	//TODO check if this characer can be viewed by this user
	return Characters.find({_id: characterId});
});

Meteor.publish("characterContainers", function(characterId, userId){
	return Containers.find({charId: characterId});
});

Meteor.publish("characterItems", function(characterId, userId){
	return Items.find({charId: characterId});
});

Meteor.publish("characterFeatures", function(characterId, userId){
	return Features.find({charId: characterId});
});

Meteor.publish("characterEffects", function(characterId, userId){
	return Effects.find({charId: characterId});
});

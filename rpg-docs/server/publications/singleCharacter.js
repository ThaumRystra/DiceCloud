Meteor.publish("singleCharacter", function(characterId, userId){
	//TODO check if this characer can be viewed by this user
	return Characters.find({_id: characterId});
});
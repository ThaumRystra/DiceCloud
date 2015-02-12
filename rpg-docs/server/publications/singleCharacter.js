Meteor.publish("singleCharacter", function(characterId, userId){
	//TODO check if this characer can be viewed by this user
	return [
		Characters.find({_id: characterId}), 
		Containers.find({charId: characterId}),
		Items.find({charId: characterId}),
		Features.find({charId: characterId}),
		Effects.find({charId: characterId}),
		Spells.find({charId: characterId}),
		SpellLists.find({charId: characterId})
	];
});
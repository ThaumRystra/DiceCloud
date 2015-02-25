Meteor.publish("singleCharacter", function(characterId, userId){
	//TODO check if this characer can be viewed by this user
	return [
		Characters.find({_id: characterId}),
		
		Actions.find({charId: characterId}),
		Attacks.find({charId: characterId}),
		Classes.find({charId: characterId}),
		Containers.find({charId: characterId}),
		Effects.find({charId: characterId}),
		Experiences.find({charId: characterId}),
		Features.find({charId: characterId}),
		Items.find({charId: characterId}),
		Levels.find({charId: characterId}),
		Notes.find({charId: characterId}),
		Spells.find({charId: characterId}),
		SpellLists.find({charId: characterId}),
	];
});

Meteor.publish("singleCharacter", function(characterId, userId){
	var char = Characters.findOne({
		_id: characterId,
		$or: [
			{readers: userId},
			{writers: userId},
			{owner: userId},
		],
	});
	if (char){
		return [
			Characters.find({_id: characterId}),
			//get all the assets for this character including soft deleted ones
			Actions.find           ({charId: characterId}, {removed: true}),
			Attacks.find           ({charId: characterId}, {removed: true}),
			Classes.find           ({charId: characterId}, {removed: true}),
			Containers.find        ({charId: characterId}, {removed: true}),
			Effects.find           ({charId: characterId}, {removed: true}),
			Experiences.find       ({charId: characterId}, {removed: true}),
			Features.find          ({charId: characterId}, {removed: true}),
			Items.find             ({charId: characterId}, {removed: true}),
			Notes.find             ({charId: characterId}, {removed: true}),
			Spells.find            ({charId: characterId}, {removed: true}),
			SpellLists.find        ({charId: characterId}, {removed: true}),
			TemporaryHitPoints.find({charId: characterId}, {removed: true}),
			Proficiencies.find     ({charId: characterId}, {removed: true}),
			Meteor.users.find      (
				{_id: {$in: _.union(char.readers, char.writers)}},
				{fields: {username: 1}}
			),
		];
	}
});

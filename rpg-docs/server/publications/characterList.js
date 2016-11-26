Meteor.publish("characterList", function(){
	const userId = this.userId;
	if (!userId) {
		this.ready();
		return;
	}

	const characterFields = {
		name: 1,
		race: 1,
		alignment: 1,
		gender: 1,
		color: 1,
		readers: 1,
		writers: 1,
		owner: 1,
	};
	abilities.forEach(function(ability) {
		characterFields[ability] = 1;
	});

	const characters = Characters.find(
		{
			$or: [
				{readers: userId},
				{writers: userId},
				{owner: userId},
			]
		},
		{
			fields: characterFields,
		}
	);

	const charIds = characters.map(function(character) {
		return character._id;
	});

	const effects = Effects.find(
		{ $and: [
			{charId: { $in: charIds }},
			{stat: { $in: abilities }},
			{enabled: true},
		]},
		{ fields: {
			stat : 1,
			operation : 1,
			value : 1,
			charId : 1,
			enabled : 1,
		}}
	);

	return [
		characters,
		effects,
	];
});

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
		hitPoints: 1,
		experience: 1,
		readers: 1,
		writers: 1,
		owner: 1,
	};
	abilities.forEach(function(ability) {
		characterFields[ability] = 1;
	});

	const characters = Characters.find(
		{ $or: [
			{readers: userId},
			{writers: userId},
			{owner: userId},
		]},
		{ fields: characterFields, }
	);

	const charIds = characters.map(function(character) {
		return character._id;
	});

	const effects = Effects.find(
		{ $and: [
			{charId: { $in: charIds }},
			{stat: { $in: _.union(abilities, ["hitPoints"]) }},
			{enabled: true},
		]},
		{ fields: {
			stat : 1,
			operation : 1,
			value : 1,
			calculation: 1,
			charId : 1,
			enabled : 1,
		}}
	);

	const classes = Classes.find(
		{ charId: { $in: charIds }},
		{ fields: {
			charId: 1,
			name: 1,
			level: 1,
		}}
	);

	const experiences = Experiences.find(
		{ charId: { $in: charIds }},
		{ fields: {
			charId : 1,
			value: 1,
		}}
	);

	return [
		characters,
		effects,
		classes,
		experiences,
	];
});

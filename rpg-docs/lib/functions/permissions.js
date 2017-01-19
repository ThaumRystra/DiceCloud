canEditCharacter = function(charId, userId){
	userId = userId || Meteor.userId();
	var char = Characters.findOne(charId, {fields: {owner: 1, writers: 1}});
	if (!char) return true;
	return (userId === char.owner || _.contains(char.writers, userId));
};

canViewCharacter = function(charId, userId){
	userId = userId || Meteor.userId();
	var char = Characters.findOne(
		charId,
		{fields: {owner: 1, writers: 1, readers: 1}}
	);
	if (!char) return true;
	return userId === char.owner ||
		_.contains(char.writers, userId) ||
		_.contains(char.readers, userId);
};

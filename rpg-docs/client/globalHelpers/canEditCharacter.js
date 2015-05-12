Template.registerHelper("canEditCharacter", function(charId) {
	var char = Characters.findOne(charId)
	var userId = Meteor.userId();
	return char.owner === userId ||
		_.contains(char.writers, userId);
});

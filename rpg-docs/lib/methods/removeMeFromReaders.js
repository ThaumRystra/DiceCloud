Meteor.methods({
	removeMeFromReaders: function(charId) {
		var userId = Meteor.userId();
		var character = Characters.findOne(charId);

		if (!character) return;
		if (!_.contains(character.readers, userId)) return;

		Characters.update(charId, {$pull: {"readers": userId}}); //we don't check write permission as you should always be able to remove youself from readers
	}
});
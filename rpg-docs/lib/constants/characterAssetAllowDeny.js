Meteor.methods({
	canWriteCharacter: function(charId) {
		var userId = this.userId;
		var char = Characters.findOne(
			charId,
			{fields: {owner: 1, writers: 1}}
		);
		return (userId && char.owner === userId || _.contains(char.writers, userId));
	},
});

CHARACTER_SUBSCHEMA_ALLOW = {
	// the user must be logged in, and the user must be a writer of the character
	insert: function(userId, doc) {
		var char = Characters.findOne(
			doc.charId,
			{fields: {owner: 1, writers: 1}}
		);
		return (userId && char.owner === userId || _.contains(char.writers, userId));
	},
	update: function(userId, doc, fields, modifier) {
		var char = Characters.findOne(
			doc.charId,
			{fields: {owner: 1, writers: 1}}
		);
		return (userId && char.owner === userId || _.contains(char.writers, userId));
	},
	remove: function(userId, doc) {
		var char = Characters.findOne(
			doc.charId,
			{fields: {owner: 1, writers: 1}}
		);
		return userId && char.owner === userId || _.contains(char.writers, userId);
	},
	fetch: ["charId"],
};

CHARACTER_SUBSCHEMA_DENY = {
	update: function(userId, doc, fields, modifier) {
		if (modifier && modifier.$set && modifier.$set.charId){
			var id1 = doc.charId;
			var char1 = Characters.findOne(
				id1,
				{fields: {owner: 1, writers: 1}}
			) || {};
			var char1Allowed = (
				userId && char1.owner === userId || _.contains(char1.writers, userId)
			);
			var id2 = modifier.$set.charId;
			var char2 = Characters.findOne(
				id2,
				{fields: {owner: 1, writers: 1}}
			) || {};
			var char2Allowed = (
				userId && char1.owner === userId || _.contains(char1.writers, userId)
			);
			return (!char1Allowed || !char2Allowed);
		}
	},
	fetch: ["charId"],
};

CHARACTER_SUBSCHEMA_ALLOW = {
	// the user must be logged in, and the user must be a writer of the character
	insert: function (userId, doc) {
		var char = Characters.findOne( doc.charId, { fields: {owner: 1, writers: 1} } );
		return ( userId && char.owner === userId || _.contains(char.writers, userId) );
	},
	update: function (userId, doc, fields, modifier) {
		var char = Characters.findOne( doc.charId, { fields: {owner: 1, writers: 1} } );
		return ( userId && char.owner === userId || _.contains(char.writers, userId) );
	},
	remove: function (userId, doc) {
		var char = Characters.findOne( doc.charId, { fields: {owner: 1, writers: 1} } );
		return ( userId && char.owner === userId || _.contains(char.writers, userId) );
	},
	fetch: ["charId"]
};

CHARACTER_SUBSCHEMA_DENY = {
	update: function (userId, docs, fields, modifier) {
		// can't change character
		return _.contains(fields, 'charId');
	},
	fetch: ["charId"]
};

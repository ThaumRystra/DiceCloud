Blacklist = new Mongo.Collection("blacklist");

Schemas.Blacklist = schema({
	userId: {
		type: String,
	},
});

Blacklist.attachSchema(Schemas.Blacklist);

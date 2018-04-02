Blacklist = new Mongo.Collection("blacklist");

Schemas.Blacklist = new SimpleSchema({
	userId: {
		type: String,
	},
});

Blacklist.attachSchema(Schemas.Blacklist);

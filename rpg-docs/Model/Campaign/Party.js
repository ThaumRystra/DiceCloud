Parties = new Meteor.Collection("parties");

Schemas.Party = new SimpleSchema({
	//each character/monster can only be in one party at a time
	//each party can only be in a single instance at a time
});

Parties.attachSchema(Schemas.Party);
//set up the collection for containers
Containers = new Meteor.Collection("containers");


Schemas.Container = new SimpleSchema({
	name: 		{ type: String },
	charId: 	{ type: String, regEx: SimpleSchema.RegEx.Id},
	isCarried: 	{ type: Boolean }
});

Containers.attachSchema(Schemas.Container);
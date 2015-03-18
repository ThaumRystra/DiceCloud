Instances = new Mongo.Collection("instances");

Schemas.Instance = new SimpleSchema({
	//an instance is a single flow of time all parties in an instance are in-sync time wise
});

Instances.attachSchema(Schemas.Instance);
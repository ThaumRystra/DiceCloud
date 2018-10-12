let Instances = new Mongo.Collection("instances");

let instanceSchema = new SimpleSchema({
	//an instance is a single flow of time all parties in an instance are in-sync time wise
});

Instances.attachSchema(instanceSchema);

export default Instances;

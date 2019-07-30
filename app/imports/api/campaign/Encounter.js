import SimpleSchema from 'simpl-schema';

let Encounters = new Mongo.Collection("encounters");

let EncounterSchema = new SimpleSchema({
	//an encounter is a single flow of time all parties in an encounter are in-sync time wise
});

Encounters.attachSchema(EncounterSchema);

export default Encounters;

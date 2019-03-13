import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';

let Encounters = new Mongo.Collection("encounters");

let EncounterSchema = schema({
	//an encounter is a single flow of time all parties in an encounter are in-sync time wise
});

Encounters.attachSchema(EncounterSchema);

export default Encounters;

import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import {makeParent} from "/imports/api/parenting.js";
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";

let Buffs = new Mongo.Collection("buffs");

let buffSchema = schema({
	charId: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		index: 1,
	},
	name: {
		type: String,
		optional: true,
		trim: false,
	},
	description: {
		type: String,
		optional: true,
		trim: false,
	},
	enabled: {
		type: Boolean,
		defaultValue: true,
	},
	type: {
		type: String,
		allowedValues: [
			"inate", //this should be "innate", but changing it could be problematic
			"custom",
		],
	},
	lifeTime: {
		type: Object,
	},
	"lifeTime.total": {
		type: Number,
		defaultValue: 0, //0 is infinite
		min: 0,
	},
	"lifeTime.spent": {
		type: Number,
		defaultValue: 0,
		min: 0,
	},
	appliedBy: { //the charId of whoever applied the buff
		type: String,
		regEx: SimpleSchema.RegEx.Id,
	},
	appliedByDetails: {//the name and collection of the thing that applied the buff
		type: Object,
		optional: true,
	},
	"appliedByDetails.name": {
		type: String,
	},
	"appliedByDetails.collection": {
		type: String,
	},
});

Buffs.attachSchema(buffSchema);
Buffs.attachSchema(ColorSchema);

//Buffs.attachBehaviour("softRemovable");
makeParent(Buffs, ["name", "enabled"]); //parents of effects, attacks, proficiencies

export default Buffs;

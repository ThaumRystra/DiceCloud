import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import {makeParent} from "/imports/api/parenting.js";
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";

let Conditions = new Mongo.Collection("conditions");

conditionSchema = schema({
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
});

Conditions.attachSchema(conditionSchema);
Conditions.attachSchema(ColorSchema);

//Conditions.attachBehaviour("softRemovable");
makeParent(Conditions, ["name"]); //parents of effects, attacks, proficiencies

export default Conditions;

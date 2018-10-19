import SimpleSchema from 'simpl-schema';
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";
import {makeParent} from "/imports/api/parenting.js";

let Features = new Mongo.Collection("features");

let featureSchema = new SimpleSchema({
	charId:		  {type: String, regEx: SimpleSchema.RegEx.Id, index: 1},
	name:         {type: String, optional: true, trim: false},
	description:  {type: String, optional: true, trim: false},
	uses:         {type: String, optional: true, trim: false},
	used:         {type: SimpleSchema.Integer, defaultValue: 0},
	reset:        {
		type: String,
		allowedValues: ["manual", "longRest", "shortRest"],
		defaultValue: "manual",
	},
	enabled:      {type: Boolean, defaultValue: true},
	alwaysEnabled:{type: Boolean, defaultValue: true},
});

Features.attachSchema(featureSchema);
Features.attachSchema(ColorSchema);

//Features.attachBehaviour("softRemovable");
makeParent(Features, ["name", "enabled"]); //parents of effects and attacks

export default Features;

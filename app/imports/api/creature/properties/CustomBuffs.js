import SimpleSchema from 'simpl-schema';
import {makeParent, makeChild} from "/imports/api/parenting.js";

let CustomBuffs = new Mongo.Collection("customBuffs");

customBuffSchema = new SimpleSchema({
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
	target: {
		type: String,
		allowedValues: [
			"self",
			"others",
			"both"
		],
		defaultValue: "self",
	},
	enabled: {
		type: Boolean,
		autoValue: function(){
			return false;
			//enabled is ALWAYS false on these, so that its children are also not enabled, so that the buff templates have no effects.
		},
	},
	lifeTime: {
		type: Object,
	},
	"lifeTime.total": {
		type: Number,
		defaultValue: 0, //0 is infinite
		min: 0,
	},
});

CustomBuffs.attachSchema(customBuffSchema);

//CustomBuffs.attachBehaviour("softRemovable");
makeParent(CustomBuffs, ["name", "enabled"]); //parents of effects, attacks, proficiencies. Since this represents a template, "enabled" is always false.
makeChild(CustomBuffs); //children of lots of things

export default CustomBuffs;

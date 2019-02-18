import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import {makeChild} from "/imports/api/parenting.js";
import DamageSchema from '/imports/api/creature/subSchemas/DamageSchema.js';

let Attacks = new Mongo.Collection("attacks");

/*
 * Attacks are given to a character by items and features
 */
attackSchema = schema({
	charId: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		index: 1,
	},
	name: {
		type: String,
		defaultValue: "New Attack",
		optional: true,
		trim: false,
	},
	details: {
		type: String,
		optional: true,
		trim: false,
	},
	attackBonus: {
		type: String,
		defaultValue: "strengthMod + proficiencyBonus",
		optional: true,
		trim: false,
	},
	damages: {
		type: Array,
		defaultValue: [],
	},
	'damages.$': {
		type: DamageSchema,
	},
	enabled: {
		type: Boolean,
		defaultValue: true,
	},
});

Attacks.attachSchema(attackSchema);

//Attacks.attachBehaviour("softRemovable");
makeChild(Attacks, ["name", "enabled"]); //children of lots of things

Attacks.after.insert(function (userId, attack) {
	//Check to see if this attack's parent is a spell, if so, mirror prepared state to enabled
	if (attack.parent.collection === "Spells") {
		var parentSpell = Spells.findOne(attack.parent.id);
		if (parentSpell.prepared === "unprepared") {
			Attacks.update(attack._id, {$set: {enabled: false}});
		} else if (parentSpell.prepared === "prepared" || "always") {
			Attacks.update(attack._id, {$set: {enabled: true}});
		}
	}
});

export default Attacks;

import Creatures from "/imports/api/creature/Creatures.js";
import Actions from "/imports/api/creature/properties/Actions.js";
import Attacks from "/imports/api/creature/properties/Attacks.js";
import Attributes from "/imports/api/creature/properties/Attributes.js";
import Buffs from "/imports/api/creature/properties/Buffs.js";
import Classes from "/imports/api/creature/properties/Classes.js";
import Conditions from "/imports/api/creature/properties/Conditions.js";
import CustomBuffs from "/imports/api/creature/properties/CustomBuffs.js";
import DamageMultipliers from "/imports/api/creature/properties/DamageMultipliers.js";
import Effects from "/imports/api/creature/properties/Effects.js";
import Experiences from "/imports/api/creature/properties/Experiences.js";
import Features from "/imports/api/creature/properties/Features.js";
import Notes from "/imports/api/creature/properties/Notes.js";
import Skills from "/imports/api/creature/properties/Skills.js";
import Spells from "/imports/api/creature/properties/Spells.js";
import SpellLists from "/imports/api/creature/properties/SpellLists.js";
import Proficiencies from "/imports/api/creature/properties/Proficiencies.js";
import Containers from "/imports/api/inventory/Containers.js";
import Items from "/imports/api/inventory/Items.js";

Meteor.publish("singleCharacter", function(charId){
	userId = this.userId;
	var char = Creatures.findOne({
		_id: charId,
		$or: [
			{readers: userId},
			{writers: userId},
			{owner: userId},
			{"settings.viewPermission": "public"},
		],
	});
	if (char){
		return [
			Creatures.find({_id: charId}),
			//get all the assets for this character including soft deleted ones
			Actions.find            ({charId}, {removed: true}),
			Attacks.find            ({charId}, {removed: true}),
			Attributes.find         ({charId}, {removed: true}),
			Buffs.find              ({charId}, {removed: true}),
			Classes.find            ({charId}, {removed: true}),
			Conditions.find         ({charId}, {removed: true}),
			Containers.find         ({charId}, {removed: true}),
			CustomBuffs.find        ({charId}, {removed: true}),
			DamageMultipliers.find  ({charId}, {removed: true}),
			Effects.find            ({charId}, {removed: true}),
			Experiences.find        ({charId}, {removed: true}),
			Features.find           ({charId}, {removed: true}),
			Items.find              ({charId}, {removed: true}),
			Notes.find              ({charId}, {removed: true}),
			Skills.find             ({charId}, {removed: true}),
			Spells.find             ({charId}, {removed: true}),
			SpellLists.find         ({charId}, {removed: true}),
			Proficiencies.find      ({charId}, {removed: true}),
		];
	} else {
		return [];
	}
});

DDPRateLimiter.addRule({
	name: "singleCharacter",
	type: "subscription",
	userId: null,
	connectionId(){ return true; },
}, 8, 10000, function(reply, ruleInput){
	if(!reply.allowed){
		logRateError(reply, ruleInput);
	}
});

Meteor.publish("singleCharacterName", function(charId){
	userId = this.userId;
	return Creatures.find({
		_id: charId,
		$or: [
			{readers: userId},
			{writers: userId},
			{owner: userId},
			{"settings.viewPermission": "public"},
		],
	}, {
		fields:{"name": 1}
	});
});

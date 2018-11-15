import Characters from "/imports/api/creature/Creatures.js";
import Actions from "/imports/api/creature/Actions.js";
import Attacks from "/imports/api/creature/Attacks.js";
import Attributes from "/imports/api/creature/Attributes.js";
import Buffs from "/imports/api/creature/Buffs.js";
import Classes from "/imports/api/creature/Classes.js";
import Conditions from "/imports/api/creature/Conditions.js";
import Containers from "/imports/api/creature/Containers.js";
import CustomBuffs from "/imports/api/creature/CustomBuffs.js";
import DamageMultipliers from "/imports/api/creature/DamageMultipliers.js";
import Effects from "/imports/api/creature/Effects.js";
import Experiences from "/imports/api/creature/Experiences.js";
import Features from "/imports/api/creature/Features.js";
import Items from "/imports/api/creature/Items.js";
import Notes from "/imports/api/creature/Notes.js";
import Skills from "/imports/api/creature/Skills.js";
import Spells from "/imports/api/creature/Spells.js";
import SpellLists from "/imports/api/creature/SpellLists.js";
import TemporaryHitPoints from "/imports/api/creature/TemporaryHitPoints.js";
import Proficiencies from "/imports/api/creature/Proficiencies.js";

Meteor.publish("singleCharacter", function(characterId){
	userId = this.userId;
	var char = Characters.findOne({
		_id: characterId,
		$or: [
			{readers: userId},
			{writers: userId},
			{owner: userId},
			{"settings.viewPermission": "public"},
		],
	});
	if (char){
		return [
			Characters.find({_id: characterId}),
			//get all the assets for this character including soft deleted ones
			Actions.find            ({charId: characterId}, {removed: true}),
			Attacks.find            ({charId: characterId}, {removed: true}),
			Attributes.find         ({charId: characterId}, {removed: true}),
			Buffs.find              ({charId: characterId}, {removed: true}),
			Classes.find            ({charId: characterId}, {removed: true}),
			Conditions.find         ({charId: characterId}, {removed: true}),
			Containers.find         ({charId: characterId}, {removed: true}),
			CustomBuffs.find        ({charId: characterId}, {removed: true}),
			DamageMultipliers.find  ({charId: characterId}, {removed: true}),
			Effects.find            ({charId: characterId}, {removed: true}),
			Experiences.find        ({charId: characterId}, {removed: true}),
			Features.find           ({charId: characterId}, {removed: true}),
			Items.find              ({charId: characterId}, {removed: true}),
			Notes.find              ({charId: characterId}, {removed: true}),
			Skills.find             ({charId: characterId}, {removed: true}),
			Spells.find             ({charId: characterId}, {removed: true}),
			SpellLists.find         ({charId: characterId}, {removed: true}),
			TemporaryHitPoints.find ({charId: characterId}, {removed: true}),
			Proficiencies.find      ({charId: characterId}, {removed: true}),
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

Meteor.publish("singleCharacterName", function(characterId){
	userId = this.userId;
	return Characters.find({
		_id: characterId,
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

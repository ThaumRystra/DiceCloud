import Creatures from '/imports/api/creature/Creatures.js';
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';

Meteor.publish('singleCharacter', function(charId){
	userId = this.userId;
	var char = Creatures.findOne({
		_id: charId,
		$or: [
			{readers: userId},
			{writers: userId},
			{owner: userId},
			{'settings.viewPermission': 'public'},
		],
	});
	if (char){
		return [
			Creatures.find({_id: charId}),
			CreatureProperties.find({
				'ancestors.id': charId,
			}),
		];
	} else {
		return [];
	}
});

DDPRateLimiter.addRule({
	name: 'singleCharacter',
	type: 'subscription',
	userId: null,
	connectionId(){ return true; },
}, 8, 10000, function(reply, ruleInput){
	if(!reply.allowed){
		logRateError(reply, ruleInput);
	}
});

Meteor.publish('singleCharacterName', function(charId){
	userId = this.userId;
	return Creatures.find({
		_id: charId,
		$or: [
			{readers: userId},
			{writers: userId},
			{owner: userId},
			{'settings.viewPermission': 'public'},
		],
	}, {
		fields:{'name': 1}
	});
});

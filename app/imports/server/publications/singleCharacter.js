import Creatures from '/imports/api/creature/Creatures.js';
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';

Meteor.publish('singleCharacter', function(charId){
	let userId = this.userId;
	var char = Creatures.findOne({
		_id: charId,
		$or: [
			{readers: userId},
			{writers: userId},
			{owner: userId},
			{public: true},
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

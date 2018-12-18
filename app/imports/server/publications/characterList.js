import Creatures from "/imports/api/creature/Creatures.js";
import Parties from '/imports/api/campaign/Parties.js';

Meteor.publish("characterList", function(){
	var userId = this.userId;
	if (!userId) {
		this.ready();
		return;
	}
	return [
			Creatures.find(
			{$or: [{readers: userId}, {writers: userId}, {owner: userId}], type: "pc"},
			{
				fields: {
					name: 1,
					urlName: 1,
					race: 1,
					alignment: 1,
					gender: 1,
					readers: 1,
					writers:1,
					owner: 1,
					color: 1,
					picture: 1,
				}
			}
		),
		Parties.find({owner: userId}),
	];
});

DDPRateLimiter.addRule({
	name: "characterList",
	type: "subscription",
	userId(){ return true; },
	connectionId(){ return true; },
}, 8, 5000);

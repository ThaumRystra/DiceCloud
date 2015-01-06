Meteor.methods({
	updateAttack: function (charId, oldAttack, newAttack) {
		var selector = {_id: charId, "attacks._id": oldAttack._id};
		var setter = {"attacks.$": newAttack};
		Characters.update(
			selector,
			{ $set: setter }
		);
	}
});

pullAttack = function(id, attack){
	var pullObject = {};
	pullObject["attacks"] = {_id: attack._id};
	Characters.update(id, {$pull: pullObject });
};

pushAttack = function(id, attack){
	var pushObject = {};
	pushObject["attacks"] = attack;
	Characters.update(id, {$push: pushObject});
};

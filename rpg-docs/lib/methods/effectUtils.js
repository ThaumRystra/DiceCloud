Meteor.methods({
	updateEffect: function (charId, attributeName, effectId, newEffect) {
		var selector = {_id: charId};
		selector[attributeName + ".effects._id"] = effectId;
		var setter = {};
		setter[attributeName + ".effects.$"] = newEffect
		Characters.update(
			selector,
			{ $set: setter }
		)
	}
});

//pull a single effect by stat and id
pullEffect = function(id, effect){
	var pullObject = {};
	pullObject[effect.stat + ".effects"] = {_id: effect._id};
	Characters.update(id, {$pull: pullObject });
}

pushEffect = function(id, effect){
	var pushObject = {};
	pushObject[effect.stat + ".effects"] = effect;
	Characters.update(id, {$push: pushObject});
}



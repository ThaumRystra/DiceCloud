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
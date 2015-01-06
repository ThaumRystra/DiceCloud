Meteor.methods({
	updateSpell: function (charId, oldSpell, newSpell) {
		var selector = {_id: charId, "spells._id": oldSpell._id};
		var setter = {"spells.$": newSpell};
		Characters.update(
			selector,
			{ $set: setter }
		);
	}
});

pullSpell = function(id, spell){
	var pullObject = {};
	pullObject["spells"] = {_id: spell._id};
	Characters.update(id, {$pull: pullObject });
};

pushSpell = function(id, spell){
	var pushObject = {};
	pushObject["spells"] = spell;
	Characters.update(id, {$push: pushObject});
};

Meteor.methods({
	updateAction: function (charId, oldAction, newAction) {
		var selector = {_id: charId, "actions._id": oldAction._id};
		var setter = {"actions.$": newAction};
		Characters.update(
			selector,
			{ $set: setter }
		);
	}
});

pullAction = function(id, action){
	var pullObject = {};
	pullObject["actions"] = {_id: action._id};
	Characters.update(id, {$pull: pullObject });
};

pushAction = function(id, action){
	var pushObject = {};
	pushObject["actions"] = action;
	Characters.update(id, {$push: pushObject});
};

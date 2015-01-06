Meteor.methods({
	addFeature: function(charId, newFeature){
		Characters.update(
			charId, 
			{ $push: {"customFeatures": newFeature} }
		);
		addFeatureEffects(charId, newFeature);
	},
	removeFeature: function(charId, oldFeature){
		Characters.update(
			charId,
			{ $pull: { "customFeatures": {"_id": oldFeature._id} } }
		);
		removeFeatureEffects(charId, oldFeature);
	},
	updateFeature: function (charId, oldFeature, newFeature) {
		var selector = {_id: charId, "customFeatures._id": oldFeature._id};
		var setter = {"customFeatures.$": newFeature};
		Characters.update(
			selector,
			{ $set: setter }
		);
		removeFeatureEffects(charId, oldFeature);
		addFeatureEffects(charId, newFeature);
	}
});

addFeatureEffects = function(charId, newFeature){
	_.each(newFeature.effects, function(effect){
		pushEffect(charId, effect);
	});
	_.each(newFeature.actions, function(action){
		pushAction(charId, action);
	});
	_.each(newFeature.attacks, function(attack){
		pushAttack(charId, attack);
	});
	_.each(newFeature.spells, function(spell){
		pushSpell(charId, spell);
	});
}

removeFeatureEffects = function(charId, oldFeature){
	_.each(oldFeature.effects, function(effect){
		pullEffect(charId, effect);
	});
	_.each(oldFeature.actions, function(action){
		pullAction(charId, action);
	});
	_.each(newFeature.attacks, function(attack){
		pushAttack(charId, attack);
	});
	_.each(newFeature.spells, function(spell){
		pushSpell(charId, spell);
	});
};
addFeatureEffects = function(charId, newFeature){
	_.each(newFeature.effects, function(effect){
		if(newFeature.name) effect.name = newFeature.name;
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
	_.each(oldFeature.attacks, function(attack){
		pullAttack(charId, attack);
	});
	_.each(oldFeature.spells, function(spell){
		pullSpell(charId, spell);
	});
};
Effect = function(stat, value){
	this.stat = stat;
	this.value = value;
	this._id = new Mongo.ObjectID()._str;
}


pushEffects = function(characterId, effectName, effectsArray){
	//check that the arguments are of the right form
	check(characterId, String);
	check(effectName, String);
	check(effectsArray, [{ _id: String, stat: String, value: Number}]);

	for(var i = 0; i < effectsArray.length; i++){
		var effect = effectsArray[i];

		//check if the character exists with the field we are changing
		var chk = {_id: characterId}; //right id
		chk[effect.stat] = {$exists: true}; //has a field for the stat already
		if(Characters.findOne(chk)){
			var newEffect = {};
			newEffect[effect.stat] = {_id: effect.id, name: effectName, value: effect.value};
			//update the field
			Characters.update(characterId, {$push: newEffect});
		}
	}
}

pullEffects = function(characterId, effectsArray){
	//check that the arguments are of the right form
	check(characterId, String);
	check(effectsArray, [{ _id: String, stat: String, value: Number}]);

	for(var i = 0; i < effectsArray.length; i++){
		var effect = effectsArray[i];

		//check if the character exists with the field we are changing
		var chk = {_id: characterId}; //right id
		chk[effect.stat] = {$exists: true}; //has a field for the stat already
		if(Characters.findOne(chk)){
			var effectToPull = {};
			effectToPull[effect.stat] = {_id: effect.id};
			//update the field
			Characters.update(characterId, {$pull: effectToPull});
		}
	}
}
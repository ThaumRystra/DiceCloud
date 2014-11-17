//give a character a set of buffs that expire after [duration]
pushBuffs =  function(id, buffArray, duration){
	_.each(buffArray, function(buff){
		var pushObject = {};
		if(duration > 0){
			//expiry time is now plus duration
			var expiry = Characters.findOne(id, {fields: {time: 1}}).time + duration;
			//ensure the effect has an id
			buff.effect._id = buff.effect._id || Random.id();
			//build the expiration object
			var expiration = {
				stat: buff.stat,
				effectId: buff.effect._id,
				expiry: expiry
			};
			//push expiration object to character
			Characters.update(id, {$push: {expirations: expiration } });
		}
		//push the effect to the character
		pushObject[buff.stat] = buff.effect;
		Characters.update(id, {$push: pushObject});
	});
};

//pull all the buffs listed in the buffArray
pullBuffs = function(id, buffArray){
	_.each(buffArray, function(buff){
		pullEffect(id, buff.effect._id);
	});
};

//pull a single effect by stat and id
pullEffect = function(id, stat, effectId){
	var pullObject = {};
	pullObject[stat] = {_id: effectId};
	Characters.update(id, {$pull: pullObject });
}

//pull an expiry by id
pullExpiry = function(id, expiryId){
	Characters.update(id, {$pull: {expirations: {_id: expiryId} } });
}
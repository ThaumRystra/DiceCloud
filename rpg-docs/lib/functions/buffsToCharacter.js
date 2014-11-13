pushBuffs =  function(id, buffArray){
	_.each(buffArray, function(buff){
		Characters.update(id, {$push: {"buff.stat": buff.effect}});
	});
};

pullBuffs = function(id, buffArray){
	_.each(buffArray, function(buff){
		Characters.update(id, {$pull: {"buff.stat": {_id: buff.effect._id} } });
	});
};
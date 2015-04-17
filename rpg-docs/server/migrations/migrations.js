Migrations.add({
	version: 1,
	up: function() {
		return;
	}
});

Migrations.add({
	version: 2,
	name: "converts effect proficiencies to proficiency objects",
	up: function() {
		Effects.find({operation: "proficiency"}).forEach(function(effect){
			var type;
			if(_.contains(SKILLS, effect.stat)) type = "skill";
			if(_.contains(SAVES, effect.stat)) type = "save";
			if(!type) throw "stat not a skill or a save";
			Proficiencies.insert({
				charId: effect.charId,
				name: effect.stat,
				value: effect.value,
				parent: effect.parent,
				type: type,
				enabled: effect.enabled
			});
			Effects.remove(effect._id);
		});
	},
	down: function(){
		return;
	}
});

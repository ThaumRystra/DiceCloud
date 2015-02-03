Template.skillRow.helpers({
	profIcon: function(skill){
		var prof = Template.parentData(1).proficiency(this.skill);
		if(prof > 0 && prof < 1) return "profHalf.png";
		if(prof === 1) return "profSingle.png";
		if(prof > 1) return "profDouble.png";
		return "profNone.png";
	},
	failSkill: function(){
		var skill = Template.parentData(1).getField(this.skill);
		_.each(skill.effets, function(effect){
			if (effect.operation === "fail"){
				return true;
			}
		})
		return false;
	},
	advantage: function(){
		var adv = 0;
		var disadv = 0;
		var skill = Template.parentData(1).getField(this.skill);
		_.each(skill.effets, function(effect){
			if (effect.operation === "advantage"){
				adv ++;
			} else if (effect.operation === "disadvantage") {
				disadv ++;
			}
		})
		if(adv > 0 && disadv === 0) return "advantage";
		if(disadv > 0 && adv === 0) return "disadvantage";
	},
	conditionals: function(){
		var skill = Template.parentData(1).getField(this.skill);
		_.each(skill.effets, function(effect){
			if (effect.operation === "conditional"){
				return "conditionals";
			}
		})
	}
});
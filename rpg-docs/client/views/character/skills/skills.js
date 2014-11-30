Template.skills.helpers({
	saveList: function(){
		return  [
			{name: "Strength", skill: "strengthSave"},
			{name: "Dexterity", skill: "dexteritySave"},
			{name: "Constitution", skill: "constitutionSave"},
			{name: "Intelligence", skill: "intelligenceSave"},
			{name: "Wisdom", skill: "wisdomSave"},
			{name: "Charisma", skill: "charismaSave"}
		];
	},
	skillList: function(){
		return [
			{name: "Acrobatics", skill: "acrobatics"},
			{name: "Animal Handling", skill: "animalHandling"},
			{name: "Arcana", skill: "arcana"},
			{name: "Athletics", skill: "athletics"},
			{name: "Deception", skill: "deception"},
			{name: "History", skill: "history"},
			{name: "Insight", skill: "insight"},
			{name: "Intimidation", skill: "intimidation"},
			{name: "Investigation", skill: "investigation"},
			{name: "Medicine", skill: "medicine"},
			{name: "Nature", skill: "nature"},
			{name: "Perception", skill: "perception"},
			{name: "Performance", skill: "performance"},
			{name: "Persuasion", skill: "persuasion"},
			{name: "Religion", skill: "religion"},
			{name: "Sleight of Hand", skill: "sleightOfHand"},
			{name: "Stealth", skill: "stealth"},
			{name: "Survival", skill: "survival"}
		];
	}
});

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
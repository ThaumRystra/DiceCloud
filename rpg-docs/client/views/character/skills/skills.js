Template.skills.helpers({
	saveList: function(){
		return [
			{name: "Strength", skill: this.skills.strengthSave},
			{name: "Dexterity", skill: this.skills.dexteritySave},
			{name: "Constitution", skill: this.skills.constitutionSave},
			{name: "Intelligence", skill: this.skills.intelligenceSave},
			{name: "Wisdom", skill: this.skills.wisdomSave},
			{name: "Charisma", skill: this.skills.charismaSave}
		];
	},
	skillList: function(){
		return [
			{name: "Acrobatics", skill: this.skills.acrobatics},
			{name: "Animal Handling", skill: this.skills.animalHandling},
			{name: "Arcana", skill: this.skills.arcana},
			{name: "Athletics", skill: this.skills.athletics},
			{name: "Deception", skill: this.skills.deception},
			{name: "History", skill: this.skills.history},
			{name: "Insight", skill: this.skills.insight},
			{name: "Intimidation", skill: this.skills.intimidation},
			{name: "Investigation", skill: this.skills.investigation},
			{name: "Medicine", skill: this.skills.medicine},
			{name: "Nature", skill: this.skills.nature},
			{name: "Perception", skill: this.skills.perception},
			{name: "Performance", skill: this.skills.performance},
			{name: "Persuasion", skill: this.skills.persuasion},
			{name: "Religion", skill: this.skills.religion},
			{name: "Sleight of Hand", skill: this.skills.sleightOfHand},
			{name: "Stealth", skill: this.skills.stealth},
			{name: "Survival", skill: this.skills.survival}
		];
	},
	profIcon: function(skill){
		var prof = Template.parentData(1).proficiency(skill);
		if(prof > 0 && prof < 1) return "profHalf.png";
		if(prof === 1) return "profSingle.png";
		if(prof > 1) return "profDouble.png";
		return "profNone.png";
	},
	failSkill: function(){
		return this.skill.fail.length > 0;
	},
	advantage: function(){
		var adv = this.skill.advantage.length;
		var disadv = this.skill.disadvantage.length;
		if(adv > 0 && disadv === 0) return "advantage";
		if(disadv > 0 && adv === 0) return "disadvantage";
	},
	conditionals: function(){
		if(this.skill.conditional.length > 0) return "conditionals";
	}
});
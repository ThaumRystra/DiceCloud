const skillNames = function(skillName, charId){
	var skill = Characters.calculate.getField(charId, skillName);
	if (!skill) return [skillName];

	var isSave = !!skillName.match(/Save$/);
	if (isSave) {
		var groupNames = ["allSaves"];
	} else {
		var groupNames = [skill.ability+"Skills", "allSkills"];
	}

	var result = [skillName].concat(groupNames);
	return result;
};

Template.skillRow.helpers({
	skillMod: function() {
		return signedString(
			Characters.calculate.skillMod(
				Template.parentData()._id, this.skill
			)
		);
	},
	profIcon: function(){
		var charId = Template.parentData()._id;
		var prof = Characters.calculate.proficiency(charId, this.skill);
		if (prof > 0 && prof < 1) return "image:brightness-2";
		if (prof === 1) return "image:brightness-1";
		if (prof > 1) return "av:album";
		return "radio-button-unchecked";
	},
	failSkill: function(){
		var charId = Template.parentData()._id;
		return Effects.find({
			charId: charId,
			stat: this.skill,
			enabled: true,
			operation: "fail",
		}).count();
	},
	advantage: function(){
		var charId = Template.parentData()._id;
		var advantage = Characters.calculate.advantage(charId, this.skill);
		if (advantage > 0) return "advantage";
		if (advantage < 0) return "disadvantage";
	},
	conditionalCount: function(){
		var charId = Template.parentData()._id;
		return Effects.find({
			charId: charId,
			stat: {$in: skillNames(this.skill, charId)},
			enabled: true,
			operation: "conditional",
		}).count();
	},
	isPassiveShown: function(){
		if (this.showPassive === "forced") return true;
		if (this.showPassive === "ifNeeded"){
			var charId = Template.parentData()._id;
			return Effects.find({
				charId,
				stat: this.skill,
				operation: "passiveAdd",
				enabled: true,
			}).count();
		}
	},
});

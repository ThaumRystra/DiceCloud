Template.printedSkillRow.helpers({
	skillMod: function () {
		return signedString(
			Characters.calculate.skillMod(
				Template.parentData()._id, this.skill
			)
		);
	},
	profIcon: function () {
		var charId = Template.parentData()._id;
		var prof = Characters.calculate.proficiency(charId, this.skill);
		if (prof > 0 && prof < 1) return "image:brightness-2";
		if (prof === 1) return "image:brightness-1";
		if (prof > 1) return "av:album";
		return "radio-button-unchecked";
	},
	failSkill: function () {
		var charId = Template.parentData()._id;
		return Effects.find({
			charId: charId,
			stat: this.skill,
			enabled: true,
			operation: "fail",
			removed: { $ne: true },
		}).count();
	},
	advantage: function () {
		var charId = Template.parentData()._id;
		var advantage = Characters.calculate.advantage(charId, this.skill);
		if (advantage > 0) return "advantage";
		if (advantage < 0) return "disadvantage";
	},
	conditionalCount: function () {
		var charId = Template.parentData()._id;
		return Effects.find({
			charId: charId,
			stat: this.skill,
			enabled: true,
			operation: "conditional",
			removed: { $ne: true },
		}).count();
	},
});

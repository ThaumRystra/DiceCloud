Template.statCard.helpers({
	skillMod: function() {
		return signedString(
			Characters.calculate.skillMod(
				Template.parentData()._id, this.stat
			)
		);
	},
	advantage: function(){
		var charId = Template.parentData()._id;
		var advantage = Characters.calculate.advantage(charId, this.stat);
		if (advantage > 0) return "advantage";
		if (advantage < 0) return "disadvantage";
	},
});

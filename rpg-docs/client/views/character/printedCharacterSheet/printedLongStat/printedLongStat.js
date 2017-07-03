Template.printedLongStat.helpers({
	skillMod: function() {
		return signedString(
			Characters.calculate.skillMod(
				Template.parentData()._id, this.stat
			)
		);
	},
});

Template.abilityMiniCard.helpers({
	abilityMod: function() {
		return signedString(
			Characters.calculate.abilityMod(
				Template.parentData()._id, this.ability
			)
		);
	}
});

Template.abilityMiniCard.helpers({
	abilityMod: function() {
		return signedString(
			Characters.calculate.abilityMod(
				Template.parentData()._id, this.ability
			)
		);
	},
	swap: function() {
		var character = Characters.findOne({"_id": Template.parentData()._id})
		if (character) {return character.settings.swapStatAndModifier;}
		else {return false;}
	},
});

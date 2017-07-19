Template.attackEditList.helpers({
	attacks: function() {
		var cursor = Attacks.find({"parent.id": this.parentId, charId: this.charId});
		return cursor;
	}
});

Template.attackEditList.events({
	"tap #addAttackButton": function() {
		if (typeof this.isSpell !== 'undefined' && this.isSpell) {
			var parentSpell = Spells.findOne({"_id": this.parentId})
			if (parentSpell && parentSpell.parent.collection == "SpellLists") {
				var spellList = SpellLists.findOne({"_id":parentSpell.parent.id});
				if (spellList && spellList.attackBonus) {
					Attacks.insert({
						charId: this.charId,
						parent: {
							id: this.parentId,
							collection: this.parentCollection
						},
						attackBonus: "attackBonus",
						damage: "1d10",
						damageType: "fire",
					});
					return;
				}
			}
		}

		Attacks.insert({
			charId: this.charId,
			parent: {
				id: this.parentId,
				collection: this.parentCollection
			},
		});
	},
});

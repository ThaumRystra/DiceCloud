Template.printedAttack.helpers({
	evaluateAttackBonus: function(charId, attack) {
		if (attack.parent.collection == "Spells") {
			var spell = Spells.findOne(attack.parent.id);
			if (spell) {
				bonus = evaluate(charId, attack.attackBonus, {
					"spellListId": spell.parent.id
				});
			}
		} else {
			var bonus = evaluate(charId, attack.attackBonus);
		}

		if (_.isFinite(bonus)) {
			return bonus > 0 ? "+" + bonus : "" + bonus;
		} else {
			return bonus;
		}
	},
	evaluateDamage: function(charId, attack) {
		if (attack.parent.collection == "Spells") {
			var spell = Spells.findOne(attack.parent.id);
			if (spell) {
				return evaluateSpellString(charId, spell.parent.id, attack.damage);
			}
		} else {
			return evaluateString(charId, attack.damage);
		}
	},
});

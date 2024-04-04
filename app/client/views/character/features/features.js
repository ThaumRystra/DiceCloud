Template.features.helpers({
	features: function () {
		var features = Features.find({
			charId: this._id,
			removed: { $ne: true },
		}, { sort: { color: 1, name: 1 } });
		return features;
	},
	hasUses: function () {
		return this.usesValue() > 0;
	},
	noUsesLeft: function () {
		return this.usesLeft() <= 0 || !canEditCharacter(this.charId);
	},
	usesFull: function () {
		return this.usesLeft() >= this.usesValue() || !canEditCharacter(this.charId);
	},
	colorClass: function () {
		return getColorClass(this.color);
	},
	featureOrder: function () {
		return _.indexOf(_.keys(colorOptions), this.color);
	},
	attacks: function () {
		return Attacks.find(
			{
				charId: this._id,
				enabled: true,
				removed: { $ne: true },
			},
			{ sort: { color: 1, name: 1 } });
	},
	canEnable: function () {
		return !this.alwaysEnabled;
	},
	weaponProfs: function () {
		var profs = Proficiencies.find({
			charId: this._id,
			type: "weapon",
			removed: { $ne: true },
		});
		return removeDuplicateProficiencies(profs);
	},
	armorProfs: function () {
		var profs = Proficiencies.find({
			charId: this._id,
			type: "armor",
			removed: { $ne: true },
		});
		return removeDuplicateProficiencies(profs);
	},
	toolProfs: function () {
		var profs = Proficiencies.find({
			charId: this._id,
			type: "tool",
			removed: { $ne: true },
		});
		return removeDuplicateProficiencies(profs);
	},
	hasCharacters: function (string) {
		return string && string.match(/\S/);
	},
	shouldFloatyButtonBounce: function () {
		const step = Session.get("newUserExperienceStep");
		return step === 0 && Features.find({
			charId: this._id,
			removed: { $ne: true },
		}).count() <= 1;
	},
});

Template.features.events({
	"click #addFeature": function (event, instance) {
		var featureId = Features.insert({
			name: "New Feature",
			charId: this._id,
			enabled: true,
			alwaysEnabled: true,
		});
		pushDialogStack({
			template: "featureDialog",
			data: { featureId: featureId, charId: this._id, startEditing: true },
			element: event.currentTarget,
			returnElement: () => instance.find(`.featureCard[data-id='${featureId}']`),
		});
	},
	"click .featureCard .top": function (event) {
		var featureId = this._id;
		var charId = Template.parentData()._id;
		pushDialogStack({
			template: "featureDialog",
			data: { featureId: featureId, charId: charId },
			element: event.currentTarget.parentElement,
		});
	},
	"click .useFeature": function (event) {
		var featureId = this._id;
		Features.update(featureId, { $inc: { used: 1 } });
	},
	"click .resetFeature": function (event) {
		var featureId = this._id;
		Features.update(featureId, { $set: { used: 0 } });
	},
	"click .enabledCheckbox": function (event) {
		event.stopPropagation();
	},
	"change .enabledCheckbox": function (event) {
		var enabled = !this.enabled;
		Features.update(this._id, { $set: { enabled: enabled } });
	},
});

Template.resource.helpers({
	cantIncrement: function () {
		var value = Characters.calculate.attributeValue(this.char._id, this.name);
		var base = Characters.calculate.attributeBase(this.char._id, this.name);
		var baseBigger = value < base;
		return !baseBigger || !canEditCharacter(this.char._id);
	},
	cantDecrement: function () {
		var value = Characters.calculate.attributeValue(this.char._id, this.name);
		var valuePositive = value > 0;
		return !valuePositive || !canEditCharacter(this.char._id);
	},
	getColor: function () {
		var value = Characters.calculate.attributeValue(this.char._id, this.name);
		if (value > 0) {
			return this.color;
		} else {
			return "grey";
		}
	},
});

Template.resource.events({
	"click .resourceResetMax": function (event) {
		var modifier = { $set: {} };
		modifier.$set[this.name + ".adjustment"] = 0;
		Characters.update(this.char._id, modifier, { validate: false });
	},
	"click .resourceResetZero": function (event) {
		var base = Characters.calculate.attributeBase(this.char._id, this.name);
		var modifier = { $set: {} };
		modifier.$set[this.name + ".adjustment"] = -base;
		Characters.update(this.char._id, modifier, { validate: false });
	},
	"click .resourceUp": function (event) {
		var value = Characters.calculate.attributeValue(this.char._id, this.name);
		var base = Characters.calculate.attributeBase(this.char._id, this.name);
		if (value < base) {
			var modifier = { $inc: {} };
			modifier.$inc[this.name + ".adjustment"] = 1;
			Characters.update(this.char._id, modifier, { validate: false });
		}
	},
	"click .resourceDown": function (event) {
		var value = Characters.calculate.attributeValue(this.char._id, this.name);
		if (value > 0) {
			var modifier = { $inc: {} };
			modifier.$inc[this.name + ".adjustment"] = -1;
			Characters.update(this.char._id, modifier, { validate: false });
		}
	},
	"click .right": function (event, instance) {
		pushDialogStack({
			template: "attributeDialog",
			data: { name: this.title, statName: this.name, charId: this.char._id },
			element: event.currentTarget.parentElement,
		});
	},
});

Template.attackListItem.helpers({
	evaluateAttackBonus: function (charId, attack) {
		if (attack.parent.collection == "Spells") {
			var spell = Spells.findOne(attack.parent.id);
			if (spell) {
				bonus = evaluate(charId, attack.attackBonus, { "spellListId": spell.parent.id });
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
	evaluateDamage: function (charId, attack) {
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

Template.attackListItem.events({
	"click .attack": function (event, instance) {
		openParentDialog({
			parent: instance.data.attack.parent,
			charId: instance.data.charId,
			element: event.currentTarget,
		});
	},
});

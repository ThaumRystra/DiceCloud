import QRCode from "qrcode"

Template.printedCharacterSheet.onRendered(function () {
	// Quickfit is only called once on rendering, text will not resize reactively
	this.$(".shrink-to-fit").quickfit({
		min: 7,
		max: 36,
		truncate: true,
	});
	let url = `https://dicecloud.com/character/${this.data._id}`;
	let canvas = this.find("#qrCode");
	QRCode.toCanvas(canvas, url, {
		margin: 0,
		width: 200,
	}, function (error) {
		$(canvas).css("width", "60px").css("height", "60px");
		if (error) console.error(error)
	});
});

Template.printedCharacterSheet.helpers({
	character() {
		return Characters.findOne(this._id);
	},
	classes: function () {
		return Classes.find({
			charId: this._id,
			removed: { $ne: true },
		}, { sort: { createdAt: 1 } });
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
	languageProfs: function () {
		var profs = Proficiencies.find({
			charId: this._id,
			type: "language",
			removed: { $ne: true },
		});
		profs = removeDuplicateProficiencies(profs);
		if (profs.length > 3) {
			var halfway = Math.floor(profs.length / 2);
			var left = profs.slice(0, halfway);
			var right = profs.slice(halfway);
			return { left, right };
		} else {
			return { left: profs, right: [] };
		}
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
	hitDiceTotal: function () {
		let d6 = Characters.calculate.attributeValue(this._id, "d6HitDice");
		let d8 = Characters.calculate.attributeValue(this._id, "d8HitDice");
		let d10 = Characters.calculate.attributeValue(this._id, "d10HitDice");
		let d12 = Characters.calculate.attributeValue(this._id, "d12HitDice");
		d6 = d6 ? d6 + "d6" : "";
		d8 = d8 ? d8 + "d8" : "";
		d10 = d10 ? d10 + "d10" : "";
		d12 = d12 ? d12 + "d12" : "";
		return [d6, d8, d10, d12].filter(Boolean).join(" ");
	},
	characterUrl: function () {
		return `/character/${this._id}`
	},
});

Template.printedCharacterSheet.events({
	"click .printButton": function (event, instance) {
		print();
	},
	"click .backButton": function (event, instance) {
		history && history.back();
	},
});

var damageTypes = [
	"bludgeoning",
	"piercing",
	"slashing",
	"acid",
	"cold",
	"fire",
	"force",
	"lightning",
	"necrotic",
	"poison",
	"psychic",
	"radiant",
	"thunder",
];

Template.attackEdit.events({
	"tap .deleteAttack": function(event, instance) {
		Attacks.softRemoveNode(this._id);
		GlobalUI.deletedToast(this._id, "Attacks", "Attack");
	},
	"change .attackBonusInput": function(event) {
		var value = event.currentTarget.value;
		Attacks.update(this._id, {$set: {attackBonus: value}});
	},
	"change .damageInput": function(event) {
		var value = event.currentTarget.value;
		Attacks.update(this._id, {$set: {damage: value}});
	},
	"change .detailInput": function(event) {
		var value = event.currentTarget.value;
		Attacks.update(this._id, {$set: {details: value}});
	},
	"core-select .damageTypeDropdown": function(event) {
		var detail = event.originalEvent.detail;
		if (!detail.isSelected) return;
		var value = detail.item.getAttribute("name");
		if (value == this.damageType) return;
		Attacks.update(this._id, {$set: {damageType: value}});
	},
});

Template.attackEdit.helpers({
	damageTypes: function() {
		return damageTypes;
	},
	DAMAGE_DICE: function() {
		return DAMAGE_DICE;
	},
});

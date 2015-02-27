var damageTypes = ["bludgeoning", "piercing", "slashing", "acid", "cold", "fire", "force", "lightning", "necrotic", 
				  "poison", "psychic", "radiant", "thunder"];

Template.attackDialog.events({
	"color-change": function(event, instance){
		Attacks.update(instance.data.attackId, {$set: {color: event.color}});
	},
	"tap #deleteButton": function(event, instance){
		Attacks.remove(instance.data.attackId);
		GlobalUI.closeDetail()
	},
	"change #attackNameInput": function(event){
		var value = event.currentTarget.value;
		Attacks.update(this._id, {$set: {name: value}});
	},
	"change #attackBonusInput": function(event){
		var value = event.currentTarget.value;
		Attacks.update(this._id, {$set: {attackBonus: value}});
	},
	"change #damageInput": function(event){
		var value = event.currentTarget.value;
		Attacks.update(this._id, {$set: {damage: value}});
	},
	"change #rangeInput": function(event){
		var value = event.currentTarget.value;
		Attacks.update(this._id, {$set: {range: value}});
	},
	"core-select #damageTypeDropdown": function(event){
		var detail = event.originalEvent.detail;
		if(!detail.isSelected) return;
		var value = detail.item.getAttribute("name");
		if(value == this.damageType) return;
		Attacks.update(this._id, {$set: {damageType: value}});
	}
});

Template.attackDialog.helpers({
	attack: function(){
		return Attacks.findOne(this.attackId);
	},
	damageTypes: function(){
		return damageTypes;
	}
});
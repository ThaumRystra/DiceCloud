var damageTypes = ["bludgeoning", "piercing", "slashing", "acid", "cold", "fire", "force", "lightning", "necrotic", 
				  "poison", "psychic", "radiant", "thunder"];

Template.attackDialog.rendered = function(){
	var self = this;
	//update all autogrows after they've been filled
	var pata = this.$("paper-autogrow-textarea");
	pata.each(function(index, el){
		el.update($(el).children().get(0));
	})
	//update all input fields as well
	var input = this.$("paper-input");
	input.each(function(index, el){
		el.valueChanged();
	})
	//after the dialog is built, open it
	if (!this.alreadyRendered){
		Session.set("global.ui.detailShow", true);
		this.alreadyRendered = true;
	}
}

Template.attackDialog.events({
	"tap #backButton": function(){
		GlobalUI.closeDetail()
	},
	"tap #deleteAttack": function(){
		Attacks.remove(this._id);
		GlobalUI.closeDetail()
	},
	"tap #addEffectButton": function(){
		Effects.insert({
			charId: this.charId,
			sourceId: this._id,
			operation: "add",
			type: "attack"
		});
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
	},
	"core-select .colorDropdown": function(event){
		var detail = event.originalEvent.detail;
		if(!detail.isSelected) return;
		var value = detail.item.getAttribute("name");
		if(value == this.color) return;
		Attacks.update(this._id, {$set: {color: value}});
	},
});

Template.attackDialog.helpers({
	attack: function(){
		return Attacks.findOne(this.attackId);
	},
	damageTypes: function(){
		return damageTypes;
	}
});
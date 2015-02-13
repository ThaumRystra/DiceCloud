Template.spellListDialog.rendered = function(){
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

Template.spellListDialog.events({
	"tap #backButton": function(){
		GlobalUI.closeDetail();
	},
	"tap #deleteSpellList": function(){
		SpellLists.remove(this._id);
		GlobalUI.closeDetail();
	},
	//TODO clean up String -> num here so they don't need casting by Schema.clean
	//TODO validate input (integer, non-negative, etc) for these inputs and give validation errors
	"change #spellListNameInput, input #spellListNameInput": function(event){
		var value = event.currentTarget.value
		SpellLists.update(this._id, {$set: {name: value}});
	},
	"change #spellListSaveDCInput, input #spellListNameInput": function(event){
		var value = event.currentTarget.value
		SpellLists.update(this._id, {$set: {saveDC: value}});
	},
	"change #spellListAttackBonusInput, input #spellListNameInput": function(event){
		var value = event.currentTarget.value
		SpellLists.update(this._id, {$set: {attackBonus: value}});
	},
	"change #spellListMaxPreparedInput, input #spellListNameInput": function(event){
		var value = event.currentTarget.value
		SpellLists.update(this._id, {$set: {maxPrepared: value}});
	},
	"core-select .colorDropdown": function(event){
		var detail = event.originalEvent.detail;
		if(!detail.isSelected) return;
		var value = detail.item.getAttribute("name");
		SpellLists.update(this._id, {$set: {color: value}});
	}
});

Template.spellListDialog.helpers({
	spellList: function(){
		return SpellLists.findOne(this.spellListId);
	},
	colorClass: function(){
		return getColorClass(this.color)
	}
});
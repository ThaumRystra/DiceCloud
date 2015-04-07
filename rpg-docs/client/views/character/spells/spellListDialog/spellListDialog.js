Template.spellListDialog.events({
	"color-change": function(event, instance){
		SpellLists.update(instance.data.spellListId, {$set: {color: event.color}});
	},
	"tap #deleteButton": function(event, instance){
		SpellLists.softRemoveNode(instance.data.spellListId);
		GlobalUI.deletedToast(instance.data.spellListId, "SpellLists", "Spell list and contents");
		GlobalUI.closeDetail()
	},
	//TODO clean up String -> num here so they don't need casting by Schema.clean
	//TODO validate input (integer, non-negative, etc) for these inputs and give validation errors
	"change #spellListNameInput, input #spellListNameInput": function(event){
		var value = event.currentTarget.value
		SpellLists.update(this._id, {$set: {name: value}});
	},
	"change #spellListSaveDCInput, input #spellListSaveDCInput": function(event){
		var value = event.currentTarget.value
		SpellLists.update(this._id, {$set: {saveDC: value}});
	},
	"change #spellListAttackBonusInput, input #spellListAttackBonusInput": function(event){
		var value = event.currentTarget.value
		SpellLists.update(this._id, {$set: {attackBonus: value}});
	},
	"change #spellListMaxPreparedInput, input #spellListMaxPreparedInput": function(event){
		var value = event.currentTarget.value
		SpellLists.update(this._id, {$set: {maxPrepared: value}});
	},
	"change #spellListDescriptionInput": function(event){
		var value = event.currentTarget.value
		SpellLists.update(this._id, {$set: {description: value}});
	},
});

Template.spellListDialog.helpers({
	spellList: function(){
		return SpellLists.findOne(this.spellListId);
	}
});
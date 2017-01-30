Template.spellListDialog.helpers({
	spellList: function(){
		return SpellLists.findOne(this.spellListId);
	}
});

const debounce = (f) => _.debounce(f, 300);

Template.spellListDialog.events({
	"color-change": function(event, instance){
		SpellLists.update(instance.data.spellListId, {$set: {color: event.color}});
	},
	"click #deleteButton": function(event, instance){
		SpellLists.softRemoveNode(instance.data.spellListId);
		GlobalUI.deletedToast(
			instance.data.spellListId,
			"SpellLists",
			"Spell list and contents"
		);
		popDialogStack();
	},
	//TODO clean up String -> num here so they don't need casting by Schema.clean
	//TODO validate input (integer, non-negative, etc) for these inputs and give validation errors
	"change #spellListNameInput, input #spellListNameInput":
	debounce(function(event){
		const input = event.currentTarget;
		var value = input.value;
		if (!value){
			input.invalid = true;
			input.errorMessage = "Name is required";
		} else {
			input.invalid = false;
			SpellLists.update(this._id, {
				$set: {name: value}
			}, {
				removeEmptyStrings: false,
				trimStrings: false,
			});
		}
	}),
	"change #spellListSaveDCInput, input #spellListSaveDCInput":
	debounce(function(event){
		var value = event.currentTarget.value;
		SpellLists.update(this._id, {
			$set: {saveDC: value}
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
	"change #spellListAttackBonusInput, input #spellListAttackBonusInput":
	debounce(function(event){
		var value = event.currentTarget.value;
		SpellLists.update(this._id, {
			$set: {attackBonus: value}
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
	"change #spellListMaxPreparedInput, input #spellListMaxPreparedInput":
	debounce(function(event){
		var value = event.currentTarget.value;
		SpellLists.update(this._id, {
			$set: {maxPrepared: value}
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
	"input #spellListDescriptionInput": debounce(function(event){
		var value = event.currentTarget.value;
		SpellLists.update(this._id, {
			$set: {description: value}
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
});

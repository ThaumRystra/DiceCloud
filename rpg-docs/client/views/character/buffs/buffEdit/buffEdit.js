Template.buffEdit.helpers({
	name: function() {
		return this.name;
	}
});

const debounce = (f) => _.debounce(f, 300);

Template.buffEdit.events({
	"input #buffNameInput": debounce(function(event){
		const input = event.currentTarget;
		var name = input.value;
		if (!name){
			input.invalid = true;
			input.errorMessage = "Name is required";
		} else {
			input.invalid = false;
			Buffs.update(this._id, {
				$set: {name: name}
			}, {
				removeEmptyStrings: false,
				trimStrings: false,
			});
		}
	}),
	"input #buffDescriptionInput": debounce(function(event){
		var description = event.currentTarget.value;
		Buffs.update(this._id, {
			$set: {description: description}
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
	"change .enabledCheckbox": function(event){
		var enabled = !this.enabled;
		Buffs.update(this._id, {$set: {enabled: enabled}});
	},
	"click #deleteBuff": function(event, instance){
		Buffs.softRemoveNode(this._id);
		GlobalUI.deletedToast(this._id, "Buffs", "Buff");
	},
});

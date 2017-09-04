const debounce = (f) => _.debounce(f, 300);

Template.customBuffEdit.events({
	"input #buffNameInput": debounce(function(event){
		const input = event.currentTarget;
		var name = input.value;
		if (!name){
			input.invalid = true;
			input.errorMessage = "Name is required";
		} else {
			input.invalid = false;
			CustomBuffs.update(this.buff._id, {
				$set: {name: name}
			}, {
				removeEmptyStrings: false,
				trimStrings: false,
			});
		}
	}),
	"input #buffDescriptionInput": debounce(function(event){
		var description = event.currentTarget.value;
		CustomBuffs.update(this.buff._id, {
			$set: {description: description}
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
	"iron-select .target-dropdown": function(event){
		var detail = event.originalEvent.detail;
		var value = detail.item.getAttribute("name");
		if (value === this.buff.target) return;
		CustomBuffs.update(this.buff._id, {$set: {target: value}});
	},
});

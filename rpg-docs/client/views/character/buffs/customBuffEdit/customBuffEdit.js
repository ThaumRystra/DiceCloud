Template.customBuffEdit.helpers({
	buff: function(){
		return CustomBuffs.findOne(this.buffId);
	},
});

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
			CustomBuffs.update(this._id, {
				$set: {name: name}
			}, {
				removeEmptyStrings: false,
				trimStrings: false,
			});
		}
	}),
	"input #buffDescriptionInput": debounce(function(event){
		var description = event.currentTarget.value;
		CustomBuffs.update(this._id, {
			$set: {description: description}
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
});

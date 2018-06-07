Template.noteDialog.helpers({
	note: function(){
		return Notes.findOne(this.noteId);
	}
});

Template.noteDialog.events({
	"color-change": function(event, instance){
		Notes.update(instance.data.noteId, {$set: {color: event.color}});
	},
	"tap #deleteButton": function(event, instance){
		Notes.softRemove(instance.data.noteId);
		GlobalUI.deletedToast(instance.data.noteId, "Notes", "Note");
		popDialogStack();
	},
});

const debounce = (f) => _.debounce(f, 300);

Template.noteDialogEdit.events({
	"change #noteNameInput, input #noteNameInput": debounce(function(event){
		const input = event.currentTarget;
		var name = input.value;
		if (!name){
			input.invalid = true;
			input.errorMessage = "Name is required";
		} else {
			input.invalid = false;
			Notes.update(this._id, {
				$set: {name: name}
			}, {
				removeEmptyStrings: false,
				trimStrings: false,
			});
		}
	}),
	"input #noteDescriptionInput": debounce(function(event){
		var value = event.currentTarget.value;
		Notes.update(this._id, {
			$set: {description: value}
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
});

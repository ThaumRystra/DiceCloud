Template.experienceDialog.helpers({
	experience: function(){
		Experiences.findOne(this.experienceId);
		return Experiences.findOne(this.experienceId);
	},
	color: function() {
		var char = Characters.findOne(this.charId, {fields: {color: 1}});
		if (char) return getColorClass(char.color);
	},
});

Template.experienceDialog.events({
	"tap #deleteButton": function(event, instance){
		Experiences.softRemove(instance.data.experienceId);
		GlobalUI.deletedToast(
			instance.data.experienceId,
			"Experiences", "Experience"
		);
		popDialogStack();
	},
});

const debounce = (f) => _.debounce(f, 300);

Template.experienceEdit.events({
	"input #experienceNameInput, change #experienceNameInput":
	debounce(function(event){
		var value = event.currentTarget.value;
		Experiences.update(this._id, {
			$set: {name: value}
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
	"input #valueInput, change #valueInput":
	debounce(function(event){
		var value = +event.currentTarget.value;
		Experiences.update(this._id, {
			$set: {value: value}
		}, {
			removeEmptyStrings: false,
		});
	}),
	"input #experienceDescriptionInput":
	debounce(function(event){
		var value = event.currentTarget.value;
		Experiences.update(this._id, {
			$set: {description: value}
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
});

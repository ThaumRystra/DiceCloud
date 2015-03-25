Template.experienceDialog.events({
	"tap #deleteButton": function(event, instance){
		Experiences.softRemove(instance.data.experienceId);
		GlobalUI.deletedToast(instance.data.experienceId, "Experiences", "Experience");
		GlobalUI.closeDetail()
	},
	//TODO validate input (integer, non-negative, etc) for these inputs and give validation errors
	"change #experienceNameInput, input #experienceNameInput": function(event){
		var value = event.currentTarget.value
		Experiences.update(this._id, {$set: {name: value}});
	},
	"change #valueInput": function(event){
		var value = +event.currentTarget.value
		Experiences.update(this._id, {$set: {value: value}});
	},
	"change #experienceDescriptionInput": function(event){
		var value = event.currentTarget.value
		Experiences.update(this._id, {$set: {description: value}});
	}
});

Template.experienceDialog.helpers({
	experience: function(){
		Experiences.findOne(this.experienceId);
		return Experiences.findOne(this.experienceId);
	}
});

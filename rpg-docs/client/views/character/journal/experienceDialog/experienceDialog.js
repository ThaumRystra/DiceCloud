Template.experienceEdit.onRendered(function(){
	updatePolymerInputs(this);
});

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
		GlobalUI.closeDetail();
	},
});

Template.experienceEdit.events({
	"change #experienceNameInput": function(event){
		var value = event.currentTarget.value;
		Experiences.update(this._id, {$set: {name: value}});
	},
	"change #valueInput": function(event){
		var value = +event.currentTarget.value;
		Experiences.update(this._id, {$set: {value: value}});
	},
	"change #experienceDescriptionInput": function(event){
		var value = event.currentTarget.value;
		Experiences.update(this._id, {$set: {description: value}});
	},
});

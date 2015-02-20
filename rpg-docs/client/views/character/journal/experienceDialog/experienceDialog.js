Template.experienceDialog.rendered = function(){
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

Template.experienceDialog.events({
	"tap #backButton": function(){
		GlobalUI.closeDetail();
	},
	"tap #deleteExperience": function(){
		Experiences.remove(this._id);
		GlobalUI.closeDetail();
	},
	//TODO clean up String -> num here so they don't need casting by Schema.clean
	//TODO validate input (integer, non-negative, etc) for these inputs and give validation errors
	"change #experienceNameInput, input #experienceNameInput": function(event){
		var value = event.currentTarget.value
		Experiences.update(this._id, {$set: {name: value}});
	},
	"change #valueInput": function(event){
		var value = event.currentTarget.value
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

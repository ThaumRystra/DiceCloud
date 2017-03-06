Template.baseDialog.onCreated(function(){
	this.editing = new ReactiveVar(!!this.data.startEditing);
});

Template.baseDialog.helpers({
	editing: function(){
		return Template.instance().editing.get() &&
			canEditCharacter(Template.parentData().charId);
	},
	showEdit: function() {
		if (this.hideEdit) return false;
		return canEditCharacter(Template.parentData().charId);
	},
});

Template.baseDialog.events({
	"tap #backButton": function(){
		popDialogStack();
	},
	"tap #editButton": function(event, instance){
		instance.editing.set(true);
	},
	"tap #doneEditingButton": function(event, instance){
		instance.editing.set(false);
	},
});

Template.baseDialog.onCreated(function(){
	this.editing = new ReactiveVar(!!this.data.startEditing);
});

Template.baseDialog.onRendered(function(){
	//after the dialog is built, open it
	Session.set("global.ui.detailShow", true);
});

Template.baseDialog.helpers({
	editing: function(){
		return Template.instance().editing.get();
	},
});

Template.baseDialog.events({
	"tap #backButton": function(){
		GlobalUI.closeDetail();
	},
	"tap #editButton": function(event, instance){
		instance.editing.set(true);
	},
	"tap #doneEditingButton": function(event, instance){
		instance.editing.set(false);
	},
});

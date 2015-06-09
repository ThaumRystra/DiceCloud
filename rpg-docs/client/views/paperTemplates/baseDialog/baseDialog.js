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
	showEdit: function() {
		if (this.hideEdit) return false;
		var charId = Template.parentData().charId;
		var userId = Meteor.userId();
		if (!userId) return false;
		if (charId){
			var char = Characters.findOne(charId);
			if (char)
				return char.owner === userId ||
					_.contains(char.writers, userId);
		}
		return true;
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

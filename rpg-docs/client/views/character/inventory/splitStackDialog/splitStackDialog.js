Template.splitStackDialog.onRendered(function(){
	this.find("#quantityInput").focus();
});

Template.splitStackDialog.helpers({
	quantity: function(){
		var item = Items.findOne(this.id);
		if (item) return Math.round(item.quantity / 2);
	}
});

Template.splitStackDialog.events({
	"click #moveButton": function(event, instance){
		Meteor.call(
			"splitItemToParent",
			this.id,
			+instance.find("#quantityInput").value,
			{collection: this.parentCollection , id: this.parentId}
		);
		popDialogStack();
	},
	"click #cancelButton": function(event, instance){
		popDialogStack();
	},
	"click #oneButton":function(event, instance){
		instance.find("#quantityInput").value = 1;
	},
	"click #halfButton":function(event, instance){
		var val = Math.round(Items.findOne(this.id).quantity / 2);
		instance.find("#quantityInput").value = val;
	},
	"click #allButton":function(event, instance){
		instance.find("#quantityInput").value = Items.findOne(this.id).quantity;
	},
});

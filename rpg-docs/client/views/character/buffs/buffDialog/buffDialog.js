Template.buffDialog.helpers({
	buff: function(){
		return Buffs.findOne(this.buffId);
	},
});

Template.buffDialog.events({
	"click #deleteButton": function(event, instance){
		Buffs.remove(instance.data.buffId);
		popDialogStack();
	},
});
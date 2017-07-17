Template.conditionViewDialog.helpers({
	buff: function(){
		return Buffs.findOne(this.buffId);
	},
});

Template.conditionViewDialog.events({
	"click #deleteButton": function(event, instance){
		Buffs.remove(instance.data.buffId);
		popDialogStack();
	},
});
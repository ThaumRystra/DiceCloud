Template.allBuffsDialog.helpers({
	buffs: function(){
		var selector = {
			"type" : "custom",
			"charId": this.charId,
		};
		return Buffs.find(selector);
	}
});

Template.allBuffsDialog.events({
	"click #backButton": function(event, template){
		popDialogStack();
	},
})
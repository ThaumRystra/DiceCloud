Template.conditionView.events({
	"click .conditionView": function(event){
		var condition = this.condition;
		var charId = Template.parentData()._id;
		pushDialogStack({
			template: "conditionViewDialog",
			data:     {condition: condition},
			element:   event.currentTarget,
		});
	},
});

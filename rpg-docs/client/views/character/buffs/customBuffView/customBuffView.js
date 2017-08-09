Template.customBuffView.events({
	"click .apply-buff-button": function(){
		pushDialogStack({
			template: "applyBuffDialog",
			data: {buff: this.buff},
			element: event.currentTarget,
		});
	},
});
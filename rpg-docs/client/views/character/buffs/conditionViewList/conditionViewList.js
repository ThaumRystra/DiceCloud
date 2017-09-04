Template.conditionViewList.helpers({
	conditions: function() {
		return Conditions.find({"charId": this._id});
	}
});

Template.conditionViewList.events({
	"click #addCondition": function(event, template) {
		pushDialogStack({
			template: "conditionLibraryDialog",
			element: event.currentTarget,
			callback: (result) => {
				if (!result) {
					return;
				}
				else Meteor.call("giveCondition", this._id, result)
			},
			//returnElement: () => $(`[data-id='${itemId}']`).get(0),
		})
	},
});

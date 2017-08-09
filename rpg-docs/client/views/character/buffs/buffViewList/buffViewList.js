Template.buffViewList.helpers({
	conditions: function(){
		var selector = {
			"charId": this._id,
			"type": "inate",
		};
		return Buffs.find(selector);
	},
	buffs: function(){
		var selector = {
			"charId": this._id,
			"type": "custom",
		};
		return Buffs.find(selector);
	}
});

Template.buffViewList.events({
	"click #addCondition": function(event, template){
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

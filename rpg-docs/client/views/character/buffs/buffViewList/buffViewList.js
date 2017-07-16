Template.buffViewList.helpers({
	buffs: function(){
		var selector = {
			// "parent.id": this.parentId,
			"charId": this._id,
		};
		// if (this.parentGroup){
		// 	selector["parent.group"] = this.parentGroup;
		// }
		return Buffs.find(selector);
	}
});

Template.buffViewList.events({
	"click #addBuff": function(event, template){
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

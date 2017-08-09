Template.customBuffEditList.helpers({
	buffs: function(){
		var selector = {
			"parent.id": this.parentId,
			"charId": this.charId,
		};
		return CustomBuffs.find(selector);
	}
});

Template.customBuffEditList.events({
	"tap #addBuffButton": function(event, instance){
		if (!_.isBoolean(this.enabled)) {
			this.enabled = true;
		}
		const customBuffId = CustomBuffs.insert({
			name: "New Buff",
			charId: this.charId,
			parent: {
				id: this.parentId,
				collection: this.parentCollection,
			},
		});
		pushDialogStack({
			template: "customBuffEdit",
			data: {id: customBuffId},
			element: event.currentTarget,
			returnElement: () => instance.find(`tr.buff[data-id='${customBuffId}']`),
		});
	},
});

Template.customBuffEditListItem.events({
	"tap .edit-buff": function(event, template){
		pushDialogStack({
			template: "customBuffEdit",
			data: {id: this.buff._id},
			element: event.currentTarget.parentElement.parentElement,
		});
	},
});
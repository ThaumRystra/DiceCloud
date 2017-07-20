Template.buffListItem.events({
	"click .buffListItem": function(event){
		openParentDialog({
			parent: this.buff.parent,
			charId: this.buff.charId,
			element: event.currentTarget,
		});
	},
	"click .enabledCheckbox": function(event){
		event.stopPropagation(); //so it doesn't open the dialog
	},
	"change .enabledCheckbox": function(event){
		var enabled = !this.buff.enabled;
		Buffs.update(this.buff._id, {$set: {"enabled": enabled}});
	},
});
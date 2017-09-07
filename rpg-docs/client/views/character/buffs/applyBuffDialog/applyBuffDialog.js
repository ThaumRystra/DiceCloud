Template.applyBuffDialog.onCreated(function(){
	this.selectedTarget = new ReactiveVar("default");
});

Template.applyBuffDialog.helpers({
	cantApply: function() {
		return this.buff.target === "others" && Template.instance().selectedTarget.get() === "default"; //this is the only case where we can't apply a buff
	},
	canApplyToSelf: function() {
		return this.buff.target !== "others"; //i.e. it is "self" or "both"
	},
});

Template.applyBuffDialog.events({
	"iron-select .characterPicker": function(event){
		var detail = event.originalEvent.detail;
		var value = detail.item.getAttribute("name");
		Template.instance().selectedTarget.set(value);
	},
	"click #applyButton": function(event, instance){
		var targetId = Template.instance().selectedTarget.get();
		if (targetId === "default") {
			if (this.buff.target === "others") return; //since we have "Select a character" selected
			targetId = this.buff.charId; //otherwise, the default is to target self
		}

		popDialogStack(targetId);
	},
	"click #cancelButton": function(event, instance){
		popDialogStack();
	},
});

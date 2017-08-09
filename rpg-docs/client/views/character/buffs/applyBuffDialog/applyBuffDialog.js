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
	writableCharacters: function() {
		var returnArray = [];
		Characters.find({_id: {$ne: this.buff.charId}}).forEach(function(char){ //we look through all characters we have access to
			if (canEditCharacter(char._id)) {
				returnArray.push(char);
			}
		});
		return returnArray;
	},
});

Template.applyBuffDialog.events({
	"iron-select .target-dropdown": function(event){
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

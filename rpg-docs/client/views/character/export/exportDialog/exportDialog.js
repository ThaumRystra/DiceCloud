Template.exportDialog.helpers({
	character: function(){
		return Characters.findOne(this._id);
	},
	improvedInitiativeJson: function(){
		var options = {
			features: this.settings.exportFeatures,
			attacks: this.settings.exportAttacks,
			description: this.settings.exportDescription,
		}
		return improvedInitiativeJson(this._id, options);
	},
});

Template.exportDialog.events({
	"change #exportFeatures": function(event, template){
		Characters.update(this._id, {$set: {
			"settings.exportFeatures": event.target.checked,
		}});
	},
	"change #exportAttacks": function(event, template){
		Characters.update(this._id, {$set: {
			"settings.exportAttacks": event.target.checked,
		}});
	},
	"change #exportDescription": function(event, template){
		Characters.update(this._id, {$set: {
			"settings.exportDescription": event.target.checked,
		}});
	},
	"click #copyExportButton": function(event, template){
		var copyTextarea = template.find(".iiexport");
		copyTextarea && copyTextarea.select();
		try {
			var successful = document.execCommand("copy");
			var msg = successful ? "successful" : "unsuccessful";
			console.log("Copying text command was " + msg);
		} catch (err) {
			console.log("Oops, unable to copy");
		}
	},
	"click .doneButton": function(event, instance){
		popDialogStack();
	},
})

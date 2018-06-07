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
		copyTextarea.select();
		var msg;
		try {
			var successful = document.execCommand("copy");
			var msg = successful ? "JSON copied to clipboard" : "Unable to copy JSON";
		} catch (err) {
			msg = "Unable to copy JSON";
		} finally {
			clearSelection();
			GlobalUI.toast(msg);
		}
	},
	"click .doneButton": function(event, instance){
		popDialogStack();
	},
});

var clearSelection = function(){
	if (window.getSelection) {
		if (window.getSelection().empty) {  // Chrome
			window.getSelection().empty();
		} else if (window.getSelection().removeAllRanges) {  // Firefox
			window.getSelection().removeAllRanges();
		}
	} else if (document.selection) {  // IE?
		document.selection.empty();
	}
};

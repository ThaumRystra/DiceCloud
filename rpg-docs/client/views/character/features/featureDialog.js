Template.featureDialog.rendered = function(){
	var self = this;
	this.autorun(function(){
		var feature = Features.findOne(Template.currentData().featureId, {fields: {name: 1}});
		if(feature && feature.name) Session.set("global.ui.dialogHeader", feature.name);
	})
}

Template.featureDialog.events({
	"tap #addEffectButton": function(){
		var numUpdated = Features.update(this._id, {
			$push: {
				"effects": {
					name: "fe",
					operation: "add",
					type: "feature"
				}
			}
		});
		console.log("pushed add button ", numUpdated, " updated");
	},
	"change #featureNameInput": function(event){
		var name = Template.instance().find("#featureNameInput").value;
		Features.update(this._id, {$set: {name: name}});
	},
	"change #featureDescriptionInput": function(event){
		var description = Template.instance().find("#featureDescriptionInput").value;
		Features.update(this._id, {$set: {description: description}});
	}
});

Template.featureDialog.helpers({
	feature: function(){
		return Features.findOne(this.featureId);
	}
});
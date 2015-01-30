Template.featureDialog.rendered = function(){
	var self = this;
	this.autorun(function(){
		var feature = Features.findOne(Template.currentData().featureId, {fields: {name: 1}});
		if(feature && feature.name) Session.set("global.ui.dialogHeader", feature.name);
	})
	//update all autogrows after they've been filled
	var pata = this.$("paper-autogrow-textarea");
	pata.each(function(index, el){
		el.update($(el).children().get(0));
	})
	//update all input fields as well
	var input = this.$("paper-input");
	input.each(function(index, el){
		el.valueChanged();
	})
	//after the dialog is built, open it
	if (!this.alreadyRendered){
		Session.set("global.ui.detailShow", true);
		this.alreadyRendered = true;
	}
}

Template.featureDialog.events({
	"tap #backButton": function(){
		GlobalUI.closeDetail()
	},
	"tap #deleteFeature": function(){
		Features.remove(this._id);
		GlobalUI.closeDetail()
	},
	"tap #addEffectButton": function(){
		Effects.insert({
			charId: Template.currentData().charId,
			sourceId: this._id,
			operation: "add",
			type: "feature"
		});
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
	},
	effects: function(){
		var cursor = Effects.find({charId: Template.currentData().charId, type: "feature", sourceId: this._id})
		return cursor;
	}
});
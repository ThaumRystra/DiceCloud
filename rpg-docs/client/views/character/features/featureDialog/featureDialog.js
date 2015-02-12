Template.featureDialog.rendered = function(){
	var self = this;
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
	},
	"change #limitUseCheck": function(event){
		var currentUses = this.uses;
		var featureId = this._id;
		if( event.target.checked && !_.isString(currentUses) ){
			Features.update(featureId, {$set: {uses: ""}}, {removeEmptyStrings: false});
		} else if (!event.target.checked && _.isString(currentUses)){
			Features.update(featureId, {$unset: {uses: ""}});
		}
	},
	"change #usesInput, input #quantityInput": function(event){
		var value = event.target.value;
		var featureId = this._id;
		Features.update(featureId, {$set: {uses: value}});
	},
	"core-select .colorDropdown": function(event){
		var detail = event.originalEvent.detail;
		if(!detail.isSelected) return;
		var value = detail.item.getAttribute("name");
		Features.update(this._id, {$set: {color: value}});
	}
});

Template.featureDialog.helpers({
	feature: function(){
		return Features.findOne(this.featureId);
	},
	effects: function(){
		var cursor = Effects.find({sourceId: this._id, type: "feature"})
		return cursor;
	},
	usesSet: function(){
		return _.isString(this.uses);
	},
	colorClass: function(){
		return getColorClass(this.color)
	}
});
Template.featureDialog.onCreated(function(){
	this.editing = new ReactiveVar(false);
});

Template.featureDialog.helpers({
	editing: function(){
		return Template.instance().editing.get();
	},
	feature: function(){
		return Features.findOne(this.featureId);
	},
});

Template.featureDialog.events({
	"color-change": function(event, instance){
		Features.update(instance.data.featureId, {$set: {color: event.color}});
	},
	"tap #editButton": function(event, instance){
		instance.editing.set(true);
	},
	"tap #doneEditingButton": function(event, instance){
		instance.editing.set(false);
	},
	"tap #deleteButton": function(event, instance){
		Features.softRemoveNode(instance.data.featureId);
		GlobalUI.deletedToast(instance.data.featureId, "Features", "Feature");
		GlobalUI.closeDetail();
	},
});

Template.featureDetails.helpers({
	or: function(a, b){
		return a ||b;
	},
	hasUses: function(){
		return this.usesValue() > 0;
	},
	noUsesLeft: function(){
		return this.usesLeft() <= 0;
	},
	usesFull: function(){
		return this.usesLeft() >= this.usesValue();
	},
});

Template.featureDetails.events({
	"tap .useFeature": function(event){
		var featureId = this._id;
		Features.update(featureId, {$inc: {used: 1}});
	},
	"tap .resetFeature": function(event){
		var featureId = this._id;
		Features.update(featureId, {$set: {used: 0}});
	},

	"change .enabledCheckbox": function(event){
		var enabled = !this.enabled;
		Features.update(this._id, {$set: {enabled: enabled}});
	}
});

Template.featureEdit.onRendered(function(){
	updatePolymerInputs(this);
});

Template.featureEdit.helpers({
	usesSet: function(){
		return _.isString(this.uses);
	},
	enabledSelection: function(){
		if(!this.enabled) return "disabled";
		if(this.alwaysEnabled) return "alwaysEnabled";
		return "enabled";
	}
});

Template.featureEdit.events({
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
	"core-select #enabledDropdown": function(event){
		var detail = event.originalEvent.detail;
		if(!detail.isSelected) return;
		var value = detail.item.getAttribute("name");
		var setter;
		if(value === "enabled"){
			setter = {enabled: true, alwaysEnabled: false};
		} else if (value === "disabled"){
			setter = {enabled: false, alwaysEnabled: false};
		} else{
			setter = {enabled: true, alwaysEnabled: true};
		}
		if (setter.enabled === this.enabled && setter.alwaysEnabled === this.alwaysEnabled) return;
		Features.update(this._id, {$set: setter});
	},
});

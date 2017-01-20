Template.featureDialog.helpers({
	feature: function(){
		return Features.findOne(this.featureId);
	},
});

Template.featureDialog.events({
	"color-change": function(event, instance){
		Features.update(instance.data.featureId, {$set: {color: event.color}});
	},
	"tap #deleteButton": function(event, instance){
		Features.softRemoveNode(instance.data.featureId);
		GlobalUI.deletedToast(instance.data.featureId, "Features", "Feature");
		GlobalUI.closeDetail();
	},
});

Template.featureDetails.helpers({
	or: function(a, b){
		return a || b;
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
	"click .useFeature": function(event){
		var featureId = this._id;
		Features.update(featureId, {$inc: {used: 1}});
	},
	"click .resetFeature": function(event){
		var featureId = this._id;
		Features.update(featureId, {$set: {used: 0}});
	},

	"change .enabledCheckbox": function(event){
		var enabled = !this.enabled;
		Features.update(this._id, {$set: {enabled: enabled}});
	},
});

Template.featureEdit.helpers({
	usesSet: function(){
		return _.isString(this.uses);
	},
	enabledSelection: function(){
		if (this.enabled){
			if (this.alwaysEnabled){
				return "alwaysEnabled";
			} else {
				return "enabled";
			}
		} else if (this.enabled === false){ //make sure it is false, not just falsey
			return "disabled";
		}
	},
});

const debounce = (f) => _.debounce(f, 300);

Template.featureEdit.events({
	"input #featureNameInput": debounce(function(event){
		var name = event.currentTarget.value;
		Features.update(this._id, {
			$set: {name: name}
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
	"input #featureDescriptionInput": debounce(function(event){
		var description = event.currentTarget.value;
		Features.update(this._id, {
			$set: {description: description}
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
	"change #limitUseCheck": debounce(function(event){
		var currentUses = this.uses;
		var featureId = this._id;
		if (event.target.checked && !_.isString(currentUses)){
			Features.update(featureId, {
				$set: {uses: ""}
			}, {
				removeEmptyStrings: false
			});
		} else if (!event.target.checked && _.isString(currentUses)){
			Features.update(featureId, {
				$unset: {uses: ""}
			});
		}
	}),
	"input #usesInput, input #quantityInput": debounce(function(event){
		var value = event.currentTarget.value;
		var featureId = this._id;
		Features.update(featureId, {
			$set: {uses: value}
		}, {
			removeEmptyStrings: false,
		});
	}),
	"iron-select .enabled-dropdown": function(event){
		var detail = event.originalEvent.detail;
		var value = detail.item.getAttribute("name");
		var setter;
		if (value === "enabled"){
			setter = {enabled: true, alwaysEnabled: false};
		} else if (value === "disabled"){
			setter = {enabled: false, alwaysEnabled: false};
		} else {
			setter = {enabled: true, alwaysEnabled: true};
		}
		if (setter.enabled === this.enabled &&
			setter.alwaysEnabled === this.alwaysEnabled) return;
		Features.update(this._id, {$set: setter});
	},
});

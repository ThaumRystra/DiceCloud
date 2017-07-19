Template.features.helpers({
	customResources: function(){
		return CustomAttributes.find({"charId": this._id, "isResource": true}, {sort: {"displayName": 1}});
	},
	features: function(){
		var features = Features.find({charId: this._id}, {sort: {color: 1, name: 1}});
		return features;
	},
	hasUses: function(){
		return this.usesValue() > 0;
	},
	noUsesLeft: function(){
		return this.usesLeft() <= 0 || !canEditCharacter(this.charId);
	},
	usesFull: function(){
		return this.usesLeft() >= this.usesValue() || !canEditCharacter(this.charId);
	},
	colorClass: function(){
		return getColorClass(this.color);
	},
	featureOrder: function(){
		return _.indexOf(_.keys(colorOptions), this.color);
	},
	attacks: function(){
		return Attacks.find(
			{charId: this._id, enabled: true},
			{sort: {color: 1, name: 1}});
	},
	canEnable: function(){
		return !this.alwaysEnabled;
	},
	weaponProfs: function(){
		return Proficiencies.find({charId: this._id, type: "weapon"});
	},
	armorProfs: function(){
		return Proficiencies.find({charId: this._id, type: "armor"});
	},
	toolProfs: function(){
		return Proficiencies.find({charId: this._id, type: "tool"});
	},
});

Template.features.events({
	"click #addFeature": function(event, instance){
		var featureId = Features.insert({
			name: "New Feature",
			charId: this._id,
			enabled: true,
			alwaysEnabled: true,
		});
		pushDialogStack({
			template: "featureDialog",
			data:     {featureId: featureId, charId: this._id, startEditing: true},
			element: event.currentTarget,
			returnElement: () => instance.find(`.featureCard[data-id='${featureId}']`),
		});
	},
	"click .featureCard .top": function(event){
		var featureId = this._id;
		var charId = Template.parentData()._id;
		pushDialogStack({
			template: "featureDialog",
			data:     {featureId: featureId, charId: charId},
			element:   event.currentTarget.parentElement,
		});
	},
	"click .attack": function(event){
		openParentDialog({
			parent: this.parent,
			charId: this.charId,
			element: event.currentTarget,
		});
	},
	"click .useFeature": function(event){
		var featureId = this._id;
		Features.update(featureId, {$inc: {used: 1}});
	},
	"click .resetFeature": function(event){
		var featureId = this._id;
		Features.update(featureId, {$set: {used: 0}});
	},
	"click .enabledCheckbox": function(event){
		event.stopPropagation();
	},
	"change .enabledCheckbox": function(event){
		var enabled = !this.enabled;
		Features.update(this._id, {$set: {enabled: enabled}});
	},
});

Template.resource.helpers({
	cantIncrement: function(){
		if (this.isCustom) {
			var value = Characters.calculate.customAttributeValue(this.charId, this.name);
		} else {
			var value = Characters.calculate.attributeValue(this.charId, this.name);
		}
		var base = Characters.calculate.attributeBase(this.charId, this.name);
		var baseBigger = value < base;
		return !baseBigger || !canEditCharacter(this.charId);
	},
	cantDecrement: function(){
		if (this.isCustom) {
			var value = Characters.calculate.customAttributeValue(this.charId, this.name);
		} else {
			var value = Characters.calculate.attributeValue(this.charId, this.name);
		}
		var valuePositive = value > 0;
		return !valuePositive || !canEditCharacter(this.charId);
	},
	getColor: function(){
		if (this.isCustom) {
			var value = Characters.calculate.customAttributeValue(this.charId, this.name);
		} else {
			var value = Characters.calculate.attributeValue(this.charId, this.name);
		}
		if (value > 0){
			return this.color;
		} else {
			return "grey";
		}
	},
	calculateValue: function(){
		if (this.isCustom) {
			return Characters.calculate.customAttributeValue(this.charId, this.name);
		} else {
			return Characters.calculate.attributeValue(this.charId, this.name);
		};
	}
});

Template.resource.events({
	"click .resourceUp": function(event){
		if (this.isCustom) {
			var value = Characters.calculate.customAttributeValue(this.charId, this.name);
		} else {
			var value = Characters.calculate.attributeValue(this.charId, this.name);
		}
		var base = Characters.calculate.attributeBase(this.charId, this.name);
		if (value < base){
			if (this.isCustom) {
				CustomAttributes.update({"_id":this.name}, {$inc: {"adjustment": +1}}, {validate: false});
			} else {
				var modifier = {$inc: {}};
				modifier.$inc[this.name + ".adjustment"] = +1;
				Characters.update(this.charId, modifier, {validate: false});				
			}
		}
	},
	"click .resourceDown": function(event){
		if (this.isCustom) {
			var value = Characters.calculate.customAttributeValue(this.charId, this.name);
		} else {
			var value = Characters.calculate.attributeValue(this.charId, this.name);
		}
		if (value > 0){		
			if (this.isCustom) {
				CustomAttributes.update({"_id":this.name}, {$inc: {"adjustment": -1}}, {validate: false});
			} else {
				var modifier = {$inc: {}};
				modifier.$inc[this.name + ".adjustment"] = -1;
				Characters.update(this.charId, modifier, {validate: false});				
			}
		}
	},
	"click .right": function(event, instance) {
		pushDialogStack({
			template: "attributeDialog",
			data:     {name: this.title, statName: this.name, charId: this.charId, isCustom: this.isCustom},
			element: event.currentTarget.parentElement,
		});
	},
});

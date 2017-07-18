var removeDuplicateProficiencies = function(proficiencies) {
	dict = {};
	proficiencies.forEach(function(prof) {
		if (prof.name in dict) { //if we have already gone over another proficiency for the same thing
			if (dict[prof.name].value < prof.value) {
				dict[prof.name] = prof; //then take the new one if it's higher, otherwise leave it
			}
		} else {
			dict[prof.name] = prof; //if it wasn't already there, store it
		}
	});
	profs = []
	_.forEach(dict, function(prof) {
		profs.push(prof);
	})
	return profs;
};

Template.features.helpers({
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
		var profs = Proficiencies.find({charId: this._id, type: "weapon"});
		return removeDuplicateProficiencies(profs);
	},
	armorProfs: function(){
		var profs = Proficiencies.find({charId: this._id, type: "armor"});
		return removeDuplicateProficiencies(profs);
	},
	toolProfs: function(){
		var profs = Proficiencies.find({charId: this._id, type: "tool"});
		return removeDuplicateProficiencies(profs);
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
		var value = Characters.calculate.attributeValue(this.char._id, this.name);
		var base = Characters.calculate.attributeBase(this.char._id, this.name);
		var baseBigger = value < base;
		return !baseBigger || !canEditCharacter(this.char._id);
	},
	cantDecrement: function(){
		var value = Characters.calculate.attributeValue(this.char._id, this.name);
		var valuePositive = value > 0;
		return !valuePositive || !canEditCharacter(this.char._id);
	},
	getColor: function(){
		var value = Characters.calculate.attributeValue(this.char._id, this.name);
		if (value > 0){
			return this.color;
		} else {
			return "grey";
		}
	},
});

Template.resource.events({
	"click .resourceUp": function(event){
		var value = Characters.calculate.attributeValue(this.char._id, this.name);
		var base = Characters.calculate.attributeBase(this.char._id, this.name);
		if (value < base){
			var modifier = {$inc: {}};
			modifier.$inc[this.name + ".adjustment"] = 1;
			Characters.update(this.char._id, modifier, {validate: false});
		}
	},
	"click .resourceDown": function(event){
		var value = Characters.calculate.attributeValue(this.char._id, this.name);
		if (value > 0){
			var modifier = {$inc: {}};
			modifier.$inc[this.name + ".adjustment"] = -1;
			Characters.update(this.char._id, modifier, {validate: false});
		}
	},
	"click .right": function(event, instance) {
		pushDialogStack({
			template: "attributeDialog",
			data:     {name: this.title, statName: this.name, charId: this.char._id},
			element: event.currentTarget.parentElement,
		});
	},
});

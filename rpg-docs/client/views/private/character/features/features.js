Template.features.helpers({
	features: function(){
		var features = Features.find({charId: this._id}, {sort: {color: 1, name: 1}});
		return features;
	},
	shortDescription: function() {
		if (_.isString(this.description)){
			return this.description.split(/^( *[-*_]){3,} *(?:\n+|$)/m)[0];
		}
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
	"tap #addFeature": function(event){
		var featureId = Features.insert({
			name: "New Feature",
			charId: this._id,
			enabled: true,
			alwaysEnabled: true,
		});
		GlobalUI.setDetail({
			template: "featureDialog",
			data:     {featureId: featureId, charId: this._id, startEditing: true},
			heroId:   featureId,
		});
	},
	"tap #addAttackButton": function(event){
		var charId = this._id;
		Attacks.insert({
			charId: charId
		}, function(error, id){
			if (!error){
				GlobalUI.setDetail({
					template: "attackDialog",
					data:     {attackId: id, charId: charId},
					heroId:   id,
				});
			}
		});
	},
	"tap .featureCard .top": function(event){
		var featureId = this._id;
		var charId = Template.parentData()._id;
		GlobalUI.setDetail({
			template: "featureDialog",
			data:     {featureId: featureId, charId: charId},
			heroId:   featureId,
		});
	},
	"tap .attack": function(event){
		openParentDialog(this.parent, this.charId, this._id);
	},
	"tap .useFeature": function(event){
		var featureId = this._id;
		Features.update(featureId, {$inc: {used: 1}});
	},
	"tap .resetFeature": function(event){
		var featureId = this._id;
		Features.update(featureId, {$set: {used: 0}});
	},
	"tap .enabledCheckbox": function(event){
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
	"tap .resourceUp": function(event){
		var value = Characters.calculate.attributeValue(this.char._id, this.name);
		var base = Characters.calculate.attributeBase(this.char._id, this.name);
		if (value < base){
			var modifier = {$inc: {}};
			modifier.$inc[this.name + ".adjustment"] = 1;
			Characters.update(this.char._id, modifier, {validate: false});
		}
	},
	"tap .resourceDown": function(event){
		var value = Characters.calculate.attributeValue(this.char._id, this.name);
		if (value > 0){
			var modifier = {$inc: {}};
			modifier.$inc[this.name + ".adjustment"] = -1;
			Characters.update(this.char._id, modifier, {validate: false});
		}
	},
	"tap .right": function(event, instance) {
		GlobalUI.setDetail({
			template: "attributeDialog",
			data:     {name: this.title, statName: this.name, charId: this.char._id},
			heroId:   this.char._id + this.name,
		});
	},
});

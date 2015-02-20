Template.features.helpers({
	features: function(){
		var features = Features.find({charId: this._id}, {sort: {color: 1, name: 1}});
		return features;
	},
	hasUses: function(){
		return this.usesValue() > 0;
	},
	colorClass: function(){
		return getColorClass(this.color)
	},
	featureOrder: function(){
		return _.indexOf(_.keys(colorOptions), this.color);
	}
});

Template.features.events({
	"tap #addFeature": function(event){
		var featureId = Features.insert({name: "New Feature", charId: this._id});
		GlobalUI.setDetail({
			template: "featureDialog",
			data:     {featureId: featureId, charId: this._id},
			heroId:   featureId
		})
	},
	"tap .containerTop": function(event){
		var featureId = this._id;
		var charId = Template.parentData()._id;
		GlobalUI.setDetail({
			template: "featureDialog",
			data:     {featureId: featureId, charId: charId},
			heroId:   featureId
		});
	},
	"tap .useFeature": function(event){
		var featureId = this._id;
		Features.update(featureId, {$inc: {used: 1}});
	},
	"tap .resetFeature": function(event){
		var featureId = this._id;
		Features.update(featureId, {$set: {used: 0}});
	},
	"change #hitPointSlider": function(event){
		var value = event.currentTarget.value;
		var adjustment = value - this.attributeBase("hitPoints");
		Characters.update(this._id, {$set: {"hitPoints.adjustment": adjustment}});
	}
});

Template.resource.helpers({
	cantIncrement: function(){
		return !(this.char.attributeValue(this.name) < this.char.attributeBase(this.name));
	},
	cantDecrement: function(){
		return !(this.char.attributeValue(this.name) > 0);
	}
});

Template.resource.events({
	"tap .resourceUp": function(event){
		if(this.char.attributeValue(this.name) < this.char.attributeBase(this.name)){
			var modifier = {$inc: {}};
			modifier.$inc[this.name + ".adjustment"] = 1;
			Characters.update(this.char._id, modifier, {validate: false});
		}
	},
	"tap .resourceDown": function(event){
		if(this.char.attributeValue(this.name) > 0){
			var modifier = {$inc: {}};
			modifier.$inc[this.name + ".adjustment"] = -1;
			Characters.update(this.char._id, modifier, {validate: false});
		}
	}
});

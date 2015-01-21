Template.features.helpers({
	features: function(){
		var features = Features.find({charId: this._id});
		return features;
	}
});

Template.features.events({
	"tap #addFeature": function(event){
		var featureId = Features.insert({name: "New Feature", charId: this._id});
		GlobalUI.showDialog({
			heading:      "New Feature",
			template:     "featureDialog",
			data:         {featureId: featureId},
			fullOnMobile: true
		})
	},
	"tap .featureCard": function(event){
		var featureId = this._id;
		GlobalUI.showDialog({
			heading:      this.name,
			template:     "featureDialog",
			data:         {featureId: featureId},
			fullOnMobile: true
		})
	}
});
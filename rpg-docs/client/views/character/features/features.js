Template.features.helpers({
	features: function(){
		var features = Features.find({charId: this._id});
		return features;
	}
});

Template.features.events({
	"tap #addFeature": function(event){
		var featureId = Features.insert({name: "New Feature", charId: this._id});
		GlobalUI.setDetail({
			template: "featureDialog",
			data:     {featureId: featureId, charId: this._id},
			hero:     $(event.currentTarget)
		})
	},
	"tap .featureCard": function(event){
		var featureId = this._id;
		GlobalUI.setDetail({
			template: "featureDialog",
			data:     {featureId: featureId, charId: Template.parentData()._id},
			hero:     $(event.currentTarget)
		})
	}
});
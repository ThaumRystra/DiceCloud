Template.features.helpers({
	features: function(){
		var features = Features.find({character: this._id});
		return features;
	}
});

Template.features.events({
	// Fires when any element is clicked
	'change .enabled': function (event) {
		var enable = event.target.checked
		Features.update(this._id, {$set: {enabled: enable}});
		if(enable){
			Template.parentData(1).pushEffects(this.name, this.effects);
		} else {
			Template.parentData(1).pullEffects(this.effects);
		}
	}
});
Features = new Meteor.Collection("features");

Schemas.Feature = new SimpleSchema({
	charId:		{type: String, regEx: SimpleSchema.RegEx.Id, optional: true},
	name:       {type: String},
	description:{type: String, optional: true},
	effects:    {type: [Schemas.Effect], defaultValue: []},
	actions:    {type: [Schemas.Action], defaultValue: []},
	attacks:	{type: [Schemas.Attack], defaultValue: []},
	spells:		{type: [Schemas.Spell] , defaultValue: []},
});

Features.attachSchema(Schemas.Feature);

//update the features of the items as needed
Features.find({}, {fields: {name: 0, description: 0}}).observe({
	added: function(newFeature){
		if(newFeature.charId){
			//make sure existing versions of this feature's effects aren't duplicated
			removeFeatureEffects(newFeature.charId, newFeature);
			//add the new feature's effects
			addFeatureEffects(newFeature.charId, newFeature);
		}
	},
	changed: function(newFeature, oldFeature){
		if(oldFeature.charId)
			removeFeatureEffects(oldFeature.charId, oldFeature);
		if(newFeature.charId)
			addFeatureEffects(newFeature.charId, newFeature);
	},
	removed: function(oldFeature){
		if(oldFeature.charId)
			removeFeatureEffects(oldFeature.charId, oldFeature);
	}
});

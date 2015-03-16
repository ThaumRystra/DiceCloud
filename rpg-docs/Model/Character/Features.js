Features = new Meteor.Collection("features");

Schemas.Feature = new SimpleSchema({
	charId:		{type: String, regEx: SimpleSchema.RegEx.Id},
	name:       {type: String, trim: false},
	description:{type: String, optional: true, trim: false},
	uses:       {type: String, optional: true, trim: false},
	used:       {type: Number, defaultValue: 0},
	reset:      {type: String, allowedValues: ["manual", "longRest", "shortRest"], defaultValue: "manual"},
	enabled:    {type: String, allowedValues: ["enabled", "disabled", "alwaysEnabled"], defaultValue: "alwaysEnabled"},
	color:   {type: String, allowedValues: _.pluck(colorOptions, "key"), defaultValue: "q"}
});

Features.attachSchema(Schemas.Feature);

Features.helpers({
	usesLeft: function(){
		return evaluate(this.charId, this.uses) - this.used;
	},
	usesValue: function(){
		return evaluate(this.charId, this.uses);
	}
});

//Delete effects where this the removed feature is source
Features.before.remove(function (userId, feature) {
	Effects.find({sourceId: feature._id, type: "feature"}).forEach(function(effect){
		Effects.remove(effect._id);
	});
});

//keep the effects up to date with enabled state
Features.after.update(function (userId, feature, fieldNames, modifier, options) {
	var enabled = feature.enabled !== "disabled";
	Effects.find({sourceId: feature._id, type: "feature"}).forEach(function(effect){
		Effects.update(effect._id, { $set: {charId: feature.charId, enabled: enabled, name: feature.name} });
	});
}, {fetchPrevious: false});

Features.allow(CHARACTER_SUBSCHEMA_ALLOW);
Features.deny(CHARACTER_SUBSCHEMA_DENY);

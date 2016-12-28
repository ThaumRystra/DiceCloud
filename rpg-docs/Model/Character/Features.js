Features = new Mongo.Collection("features");

Schemas.Feature = new SimpleSchema({
	charId:		  {type: String, regEx: SimpleSchema.RegEx.Id, index: 1},
	name:         {type: String, trim: false},
	description:  {type: String, optional: true, trim: false},
	uses:         {type: String, optional: true, trim: false},
	used:         {type: Number, defaultValue: 0},
	reset:        {
		type: String,
		allowedValues: ["manual", "longRest", "shortRest"],
		defaultValue: "manual",
	},
	enabled:      {type: Boolean, defaultValue: true},
	alwaysEnabled:{type: Boolean, defaultValue: true},
	color: {
		type: String,
		allowedValues: _.pluck(colorOptions, "key"),
		defaultValue: "q",
	},
 	icon: {
 		type: String,
 		optional: true,
 		trim: false,
 	},
});

Features.attachSchema(Schemas.Feature);

Features.helpers({
	usesLeft: function(){
		return evaluate(this.charId, this.uses) - this.used;
	},
	usesValue: function(){
		return evaluate(this.charId, this.uses);
	},
});

Features.attachBehaviour("softRemovable");
makeParent(Features, ["name", "enabled"]); //parents of effects and attacks

Features.allow(CHARACTER_SUBSCHEMA_ALLOW);
Features.deny(CHARACTER_SUBSCHEMA_DENY);

//give characters default feature of base ability scores of 10
Characters.after.insert(function(userId, char) {
	if (Meteor.isServer){
		var featureId = Features.insert({
			name: "Base Ability Scores",
			charId: char._id,
			enabled: true,
			alwaysEnabled: true,
		});
		Effects.insert({
			stat: "strength",
			charId: char._id,
			parent: {
				id: featureId,
				collection: "Features",
			},
			operation: "base",
			value: 10,
			enabled: true,
		});
		Effects.insert({
			stat: "dexterity",
			charId: char._id,
			parent: {
				id: featureId,
				collection: "Features",
			},
			operation: "base",
			value: 10,
			enabled: true,
		});
		Effects.insert({
			stat: "constitution",
			charId: char._id,
			parent: {
				id: featureId,
				collection: "Features",
			},
			operation: "base",
			value: 10,
			enabled: true,
		});
		Effects.insert({
			stat: "intelligence",
			charId: char._id,
			parent: {
				id: featureId,
				collection: "Features",
			},
			operation: "base",
			value: 10,
			enabled: true,
		});
		Effects.insert({
			stat: "wisdom",
			charId: char._id,
			parent: {
				id: featureId,
				collection: "Features",
			},
			operation: "base",
			value: 10,
			enabled: true,
		});
		Effects.insert({
			stat: "charisma",
			charId: char._id,
			parent: {
				id: featureId,
				collection: "Features",
			},
			operation: "base",
			value: 10,
			enabled: true,
		});
	}
});

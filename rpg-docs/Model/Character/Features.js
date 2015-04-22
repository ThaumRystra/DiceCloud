Features = new Mongo.Collection("features");

Schemas.Feature = new SimpleSchema({
	charId:		  {type: String, regEx: SimpleSchema.RegEx.Id},
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
	color:   {type: String,
			  allowedValues: _.pluck(colorOptions, "key"),
			  defaultValue: "q",
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

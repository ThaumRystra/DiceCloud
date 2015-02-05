Features = new Meteor.Collection("features");

Schemas.Feature = new SimpleSchema({
	charId:		{type: String, regEx: SimpleSchema.RegEx.Id},
	name:       {type: String},
	description:{type: String, optional: true},
	uses:       {type: String, optional: true, trim: false},
	used:       {type: Number, defaultValue: 0},
	reset:      {type: String, allowedValues: ["manual", "longRest", "shortRest"], defaultValue: "manual"},
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

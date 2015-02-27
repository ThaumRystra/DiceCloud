Proficiencies = new Meteor.Collection("proficiencies");

Schemas.Proficiency = new SimpleSchema({
	charId: {
		type: String, 
		regEx: SimpleSchema.RegEx.Id
	},
	name: 	{
		type: String,
		trim: false
	},
	//indicates what type of thing proficiency originated from
	type: {
		type: String,
		defaultValue: "editable",
		allowedValues: ["editable", "feature", "buff", "equipment", "inate"]
	},
	//the id of the feature, buff or item that created this effect
	sourceId: {
		type: String, 
		regEx: SimpleSchema.RegEx.Id,
		optional: true
	},
});

Proficiencies.attachSchema(Schemas.Proficiency);

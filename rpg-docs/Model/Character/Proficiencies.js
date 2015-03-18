Proficiencies = new Mongo.Collection("proficiencies");

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
});

Proficiencies.attachSchema(Schemas.Proficiency);

Proficiencies.attachBehaviour('softRemovable');
makeChild(Proficiencies); 

Proficiencies.allow(CHARACTER_SUBSCHEMA_ALLOW);
Proficiencies.deny(CHARACTER_SUBSCHEMA_DENY);

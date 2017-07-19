CustomAttributes = new Mongo.Collection("customAttributes");

Schemas.CustomAttribute = new SimpleSchema({
	charId:      {type: String, regEx: SimpleSchema.RegEx.Id, index: 1},
	name: { type: String, min:1 },
	displayName: { type: String, min:1, trim:false },

	isResource: {type: Boolean, defaultValue: false},

	//the temporary shift of the attribute
	//should be zero after reset
	adjustment: {
		type: Number,
		defaultValue: 0,
	},
	reset: {
		type: String,
		defaultValue: "longRest",
		allowedValues: ["longRest", "shortRest"],
	},
});

CustomAttributes.attachSchema(Schemas.CustomAttribute);
CustomAttributes.attachBehaviour("softRemovable");

CustomAttributes.allow(CHARACTER_SUBSCHEMA_ALLOW);
CustomAttributes.deny(CHARACTER_SUBSCHEMA_DENY);
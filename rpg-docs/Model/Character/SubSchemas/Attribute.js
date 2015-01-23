Schemas.Attribute = new SimpleSchema({
	//the temporary shift of the attribute
	//should be zero after reset
	adjustment: {
		type: Number,
		defaultValue: 0
	},
	reset: {
		type: String,
		defaultValue: "longRest",
		allowedValues: ["longRest", "shortRest"]
	}
});

//note that to make an invulnerability add a new max of zero value
Schemas.Vulnerability = new SimpleSchema({
	//same as attribute
	adjustment: {
		type: Number,
		defaultValue: 0
	},
	reset: {
		type: String,
		defaultValue: "longRest",
		allowedValues: ["longRest", "shortRest"]
	}
});

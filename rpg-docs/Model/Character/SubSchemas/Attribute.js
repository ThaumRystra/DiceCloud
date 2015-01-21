Schemas.Attribute = new SimpleSchema({
	//the temporary shift of the attribute
	//should be zero after reset
	adjustment: {
		type: Number,
		defaultValue: 0
	},
	//effect arrays
	effects: { type: [Schemas.Effect], defaultValue: [] },
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
	//effect arrays
	effects: { 
		type: [Schemas.Effect], 
		defaultValue: [
			{type: "inate", name: "Resistance doesn't stack", operation: "min", value: 0.5}, 
			{type: "inate", name: "Vulnerability doesn't stack", operation: "max", value:  2}
		]
	},
	reset: {
		type: String,
		defaultValue: "longRest",
		allowedValues: ["longRest", "shortRest"]
	}
});

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
	mul: 		{ type: [Schemas.Effect], defaultValue: [] },
	min: 		{ type: [Schemas.Effect], defaultValue: [{name: "Resistance doesn't stack", value: 0.5}] },
	max: 		{ type: [Schemas.Effect], defaultValue: [{name: "Vulnerability doesn't stack", value:  2}] },
  reset: {
    type: String,
    defaultValue: "longRest",
    allowedValues: ["longRest", "shortRest"]
  }
});

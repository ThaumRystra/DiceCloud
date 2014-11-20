Schemas.Attribute = new SimpleSchema({
	//the unmodified value of the attribute
	//should be zero for most attributes after a long rest
	base: {
		type: Number,
		defaultValue: 0
	},
	//effect arrays
	add: 		{ type: [Schemas.Effect], defaultValue: [] },
	mul: 		{ type: [Schemas.Effect], defaultValue: [] },
	min: 		{ type: [Schemas.Effect], defaultValue: [] },
	max: 		{ type: [Schemas.Effect], defaultValue: [] },
	conditional:{ type: [Schemas.Effect], defaultValue: [] }
});

//note that to make an invulnerability add a new max of zero value
Schemas.Vulnerability = new SimpleSchema({
	//same as attribute
	base: {
		type: Number,
		defaultValue: 0
	},
	//effect arrays
	mul: 		{ type: [Schemas.Effect], defaultValue: [] },
	min: 		{ type: [Schemas.Effect], defaultValue: [{name: "Resistance doesn't stack", value: 0.5}] },
	max: 		{ type: [Schemas.Effect], defaultValue: [{name: "Vulnerability doesn't stack", value:  2}] },
});
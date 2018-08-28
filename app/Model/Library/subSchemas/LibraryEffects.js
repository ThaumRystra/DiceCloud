Schemas.LibraryEffects = new SimpleSchema({
	name: {
		type: String,
		optional: true, //TODO make necessary if there is no owner
		trim: false,
	},
	operation: {
		type: String,
		defaultValue: "add",
		allowedValues: [
			"base",
			"proficiency",
			"add",
			"mul",
			"min",
			"max",
			"advantage",
			"disadvantage",
			"passiveAdd",
			"fail",
			"conditional",
		],
	},
	// Effects either have a value OR a calculation
	value: {
		type: Number,
		decimal: true,
		optional: true,
	},
	calculation: {
		type: String,
		optional: true,
		trim: false,
	},
	//which stat the effect is applied to
	stat: {
		type: String,
		optional: true,
	},
});

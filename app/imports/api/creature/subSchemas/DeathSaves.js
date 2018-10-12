const deathSaveSchema = new SimpleSchema({
	pass: {
		type: Number,
		min: 0,
		max: 3,
		defaultValue: 0,
	},
	fail: {
		type: Number,
		min: 0,
		max: 3,
		defaultValue: 0,
	},
	canDeathSave: {
		type: Boolean,
		defaultValue: true,
	},
	stable: {
		type: Boolean,
		defaultValue: false,
	},
});

export default deathSaveSchema;

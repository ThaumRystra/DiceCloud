Schemas.Strings = new SimpleSchema({
	name:		{ type: String, defaultValue: "", optional: true },
	alignment:	{ type: String, defaultValue: "", optional: true },
	gender:		{ type: String, defaultValue: "", optional: true },
	race:		{ type: String, defaultValue: "", optional: true },
	description:{ type: String, defaultValue: "", optional: true },
	personality:{ type: String, defaultValue: "", optional: true },
	ideals:		{ type: String, defaultValue: "", optional: true },
	bonds:		{ type: String, defaultValue: "", optional: true },
	flaws:		{ type: String, defaultValue: "", optional: true },
	backstory: 	{ type: String, defaultValue: "", optional: true },
	notes: 		{ type: String, defaultValue: "", optional: true },
});
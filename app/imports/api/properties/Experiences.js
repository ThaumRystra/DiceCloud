import SimpleSchema from 'simpl-schema';

let ExperienceSchema = new SimpleSchema({
	title: {
		type: String,
		optional: true,
	},
	// Potentially long description of the event
	description: {
		type: String,
		optional: true,
	},
	// The amount of XP this experience gives
	value: {
		type: SimpleSchema.Integer,
		optional: true,
	},
	// The real-world date that it occured
	date: {
		type: Date,
		autoValue: function() {
			// If the date isn't set, set it to now
			if (!this.isSet) {
				return new Date();
			}
		},
	},
	// The date in-world of this event
	worldDate: {
		type: String,
		optional: true,
	},
});

export { ExperienceSchema };

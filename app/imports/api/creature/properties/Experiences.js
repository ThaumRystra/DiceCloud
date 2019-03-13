import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';

let Experiences = new Mongo.Collection("experience");

let ExperienceSchema = schema({
	// Potentially long description of the event
	description: {
		type: String,
		optional: true,
	},
	// The amount of XP this experience gives
	value: {
		type: SimpleSchema.Integer,
		defaultValue: 0
	},
	// The real-world date that it occured
	date: {
		type: Date,
		autoValue: function() {
			// If the date isn't set, set it to now on insert
			if (this.isInsert && !this.isSet) {
				return new Date();
			} else if (this.isUpsert && !this.isSet) {
				return {$setOnInsert: new Date()};
			}
		},
	},
	// The date in-world of this event
	worldDate: {
		type: String,
		optional: true,
	},
});

Experiences.attachSchema(PropertySchema);
Experiences.attachSchema(ExperienceSchema);

export default Experiences;
export { ExperienceSchema };

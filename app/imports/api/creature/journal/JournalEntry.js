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
  // Tags to better find this entry later
  tags: {
    type: Array,
    defaultValue: [],
  },
  'tags.$': {
    type: String,
  },
  // ID of the journal this entry belongs to
  journalId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1,
  }
});

export { ExperienceSchema };

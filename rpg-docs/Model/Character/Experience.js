Experiences = new Meteor.Collection("experience");

Schemas.Experience = new SimpleSchema({
	charId:      {type: String, regEx: SimpleSchema.RegEx.Id},
	name:		 {type: String, defaultValue: "New Experience"},
	description: {type: String, optional: true},
	value:       {type: Number, defaultValue: 0},
	dateAdded:   {
		type: Date,
		autoValue: function() {
			if (this.isInsert) {
				return new Date;
			} else if (this.isUpsert) {
				return {$setOnInsert: new Date};
			} else {
				this.unset();
			}
		}
	},
});

Experiences.attachSchema(Schemas.Experience);

import SimpleSchema from 'simpl-schema';

Experiences = new Mongo.Collection("experience");

let experienceSchema = new SimpleSchema({
	charId:      {type: String, regEx: SimpleSchema.RegEx.Id, index: 1},
	name:		 {type: String, optional: true, trim: false, defaultValue: "New Experience"},
	description: {type: String, optional: true, trim: false},
	value:       {type: SimpleSchema.Integer, defaultValue: 0},
	dateAdded:   {
		type: Date,
		autoValue: function() {
			if (this.isInsert) {
				return new Date();
			} else if (this.isUpsert) {
				return {$setOnInsert: new Date()};
			} else {
				this.unset();
			}
		},
	},
});

Experiences.attachSchema(experienceSchema);

//Experiences.attachBehaviour("softRemovable");

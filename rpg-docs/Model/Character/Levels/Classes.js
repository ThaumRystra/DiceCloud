Classes = new Meteor.Collection("classes");

Schemas.Class = new SimpleSchema({
	charId:      {type: String, regEx: SimpleSchema.RegEx.Id},
	name:		 {type: String},
	createdAt: {
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

Classes.attachSchema(Schemas.Class);

TemporaryHitPoints = new Meteor.Collection("temporaryHitPoints");

Schemas.TemporaryHitPoints = new SimpleSchema({
	charId:      {type: String, regEx: SimpleSchema.RegEx.Id},
	maximum:     {type: Number, defaultValue: 0},
	used:        {type: Number, defaultValue: 0},
	deleteOnZero:{type: Boolean, defaultValue: true},
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

TemporaryHitPoints.attachSchema(Schemas.TemporaryHitPoints);

TemporaryHitPoints.helpers({
	left: function(){
		return this.maximum - this.used;
	}
});

//remove the temporary hit points when they hit zero
TemporaryHitPoints.after.update(function (userId, thp, fieldNames, modifier, options) {
	if(thp.used >= thp.maximum && thp.deleteOnZero){
		TemporaryHitPoints.remove(thp._id);
	}
}, {fetchPrevious: false});

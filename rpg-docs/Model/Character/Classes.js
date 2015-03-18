Classes = new Mongo.Collection("classes");

Schemas.Class = new SimpleSchema({
	charId:      {type: String, regEx: SimpleSchema.RegEx.Id},
	name:		 {type: String, trim: false},
	level:		 {type: Number},
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
	color:   {type: String, allowedValues: _.pluck(colorOptions, "key"), defaultValue: "q"}
});

Classes.attachSchema(Schemas.Class);

Classes.attachBehaviour('softRemovable');
makeParent(Classes, 'name'); //parents of effects and attacks

Classes.allow(CHARACTER_SUBSCHEMA_ALLOW);
Classes.deny(CHARACTER_SUBSCHEMA_DENY);

import SimpleSchema from 'simpl-schema';
import {makeParent} from "/imports/api/parenting.js";
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";

let Classes = new Mongo.Collection("classes");

classSchema= new SimpleSchema({
	charId:      {type: String, regEx: SimpleSchema.RegEx.Id, index: 1},
	name:		 {type: String, optional: true, trim: false},
	level:		 {type: Number},
	createdAt: {
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

Classes.attachSchema(classSchema);
Classes.attachSchema(ColorSchema);

//Classes.attachBehaviour("softRemovable");
makeParent(Classes, "name"); //parents of effects and attacks

export default Classes;

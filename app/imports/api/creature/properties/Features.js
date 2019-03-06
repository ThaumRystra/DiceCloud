import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";
import OrderSchema from "/imports/api/creature/subSchemas/OrderSchema.js";
import { canEditCreature } from '/imports/api/creature/creaturePermission.js';
import { recomputeCreatureById } from '/imports/api/creature/creatureComputation.js'
import { getHighestOrder } from '/imports/api/order.js';
import {makeParent} from "/imports/api/parenting.js";

let Features = new Mongo.Collection("features");

let featureSchema = schema({
	charId:		  {type: String, regEx: SimpleSchema.RegEx.Id, index: 1},
	name:         {type: String, optional: true, trim: false},
	description:  {type: String, optional: true, trim: false},
	uses:         {type: String, optional: true, trim: false},
	used:         {type: SimpleSchema.Integer, defaultValue: 0},
	reset:        {
		type: String,
		allowedValues: ["longRest", "shortRest"],
		optional: true,
	},
	enabled:      {type: Boolean, defaultValue: true},
	alwaysEnabled:{type: Boolean, defaultValue: true},
	order: OrderSchema(),
	color: ColorSchema(),
});

Features.attachSchema(featureSchema);

//Features.attachBehaviour("softRemovable");
makeParent(Features, ["name", "enabled"]); //parents of effects and attacks

const insertFeature = new ValidatedMethod({

  name: "Features.methods.insert",

  validate: schema({
		feature: {
			type: featureSchema.omit('order', 'parent'),
		},
	}).validator({clean: true}),

  run({feature}) {
		const charId = feature.charId;
		if (canEditCreature(charId, this.userId)){
			// Set order
			feature.order = getHighestOrder({
				collection: Features,
				charId,
			}) + 1;

			// Set parent
			feature.parent = {
				id: charId,
				collection: 'Creatures',
			};

			// Insert
			let featureId = Features.insert(feature);
			recomputeCreatureById(charId);
			return featureId;
		}
  },
});

export default Features;
export { insertFeature }

import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import { assertEditPermission } from '/imports/api/creature/creaturePermissions.js';
import { recomputeCreatureById } from '/imports/api/creature/creatureComputation.js'
import { getHighestOrder } from '/imports/api/order.js';
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';
import ColorSchema from '/imports/api/creature/subSchemas/ColorSchema.js';

let Features = new Mongo.Collection('features');

let FeatureSchema = schema({
	name: {
		type: String,
		optional: true,
	},
	description: {
		type: String,
		optional: true,
	},
	alwaysEnabled: {
		type: Boolean,
		defaultValue: true
	},
});

FeatureSchema.extend(ColorSchema);

Features.attachSchema(FeatureSchema);
Features.attachSchema(PropertySchema);
Features.attachSchema(ChildSchema);

const insertFeature = new ValidatedMethod({

  name: 'Features.methods.insert',

  validate: FeatureSchema.validator({clean: true}),

  run({feature}) {
		const charId = feature.charId;
		assertEditPermission(charId, this.userId);

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
  },
});

export default Features;
export { FeatureSchema, insertFeature }

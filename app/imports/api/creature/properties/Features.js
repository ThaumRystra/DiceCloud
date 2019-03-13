import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import { assertEditPermission } from '/imports/api/creature/creaturePermissions.js';
import { recomputeCreatureById } from '/imports/api/creature/creatureComputation.js'
import { getHighestOrder } from '/imports/api/order.js';
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';
import ColorSchema from '/imports/api/creature/subSchemas/ColorSchema.js';

// Mixins
import recomputeCreatureMixin from '/imports/api/creature/recomputeCreatureMixin.js';
import { creaturePermissionMixin } from '/imports/api/creature/creaturePermissions.js';
import { setDocToLastMixin } from '/imports/api/order.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/simpleSchemaMixin.js';

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
	mixins: [
    creaturePermissionMixin,
    setDocToLastMixin,
    setDocAncestryMixin,
    ensureAncestryContainsCharIdMixin,
    simpleSchemaMixin,
  ],
  collection: Features,
  permission: 'edit',
  schema: FeatureSchema,
  run(feature) {
		return Features.insert(feature);
  },
});

const updateFeature = new ValidatedMethod({
  name: 'Features.methods.update',
  mixins: [
    creaturePermissionMixin,
    simpleSchemaMixin,
  ],
  collection: Features,
  permission: 'edit',
  schema: new SimpleSchema({
    _id: SimpleSchema.RegEx.Id,
    update: FeatureSchema.omit('name'),
  }),
  run({_id, update}) {
		return Features.update(_id, {$set: update});
  },
});

export default Features;
export { FeatureSchema, insertFeature, updateFeature }

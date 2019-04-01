import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import { assertEditPermission } from '/imports/api/creature/creaturePermissions.js';
import { recomputeCreatureById } from '/imports/api/creature/creatureComputation.js'
import { getHighestOrder } from '/imports/api/order/order.js';
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';
import ColorSchema from '/imports/api/creature/subSchemas/ColorSchema.js';

// Mixins
import creaturePermissionMixin from '/imports/api/mixins/creaturePermissionMixin.js';
import { setDocToLastMixin } from '/imports/api/mixins/setDocToLastMixin.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/mixins/simpleSchemaMixin.js';
import propagateInheritanceUpdateMixin from '/imports/api/mixins/propagateInheritanceUpdateMixin.js';
import updateSchemaMixin from '/imports/api/mixins/updateSchemaMixin.js';

let Features = new Mongo.Collection('features');

let FeatureSchema = schema({
	name: {
		type: String,
		optional: true,
	},
	enabled: {
    type: Boolean,
    defaultValue: true,
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
    setDocAncestryMixin,
    ensureAncestryContainsCharIdMixin,
		setDocToLastMixin,
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
		propagateInheritanceUpdateMixin,
    updateSchemaMixin,
    creaturePermissionMixin,
  ],
  collection: Features,
  permission: 'edit',
  schema: FeatureSchema,
});

export default Features;
export { FeatureSchema, insertFeature, updateFeature }

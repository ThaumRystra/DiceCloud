import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import { PropertySchema } from '/imports/api/creature/properties/Properties.js'
import ColorSchema from '/imports/api/creature/subSchemas/ColorSchema.js';

// Mixins
import creaturePermissionMixin from '/imports/api/creature/mixins/creaturePermissionMixin.js';
import { setDocToLastMixin } from '/imports/api/creature/mixins/setDocToLastMixin.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/creature/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/creature/mixins/simpleSchemaMixin.js';
import propagateInheritanceUpdateMixin from '/imports/api/creature/mixins/propagateInheritanceUpdateMixin.js';
import updateSchemaMixin from '/imports/api/creature/mixins/updateSchemaMixin.js';

let Features = new Mongo.Collection('features');

let FeatureSchema = new SimpleSchema({
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

const insertFeature = new ValidatedMethod({
  name: 'Features.methods.insert',
	mixins: [
		setDocToLastMixin,
		simpleSchemaMixin,
    ensureAncestryContainsCharIdMixin,
		setDocAncestryMixin,
		creaturePermissionMixin,
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
		updateSchemaMixin,
		propagateInheritanceUpdateMixin,
    creaturePermissionMixin,
  ],
  collection: Features,
  permission: 'edit',
  schema: FeatureSchema,
});

export default Features;
export { FeatureSchema, insertFeature, updateFeature }

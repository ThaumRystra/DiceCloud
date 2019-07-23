import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import { PropertySchema } from '/imports/api/creature/properties/Properties.js'
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX.js';

// Mixins
import creaturePermissionMixin from '/imports/api/creature/mixins/creaturePermissionMixin.js';
import { setDocToLastMixin } from '/imports/api/creature/mixins/setDocToLastMixin.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/creature/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/creature/mixins/simpleSchemaMixin.js';
import propagateInheritanceUpdateMixin from '/imports/api/creature/mixins/propagateInheritanceUpdateMixin.js';
import updateSchemaMixin from '/imports/api/creature/mixins/updateSchemaMixin.js';

let ClassLevels = new Mongo.Collection("classLevels");

let ClassLevelSchema = schema({
	name: {
		type: String,
		optional: true,
	},
	// The name of this class level's variable
	variableName: {
    type: String,
		regEx: VARIABLE_NAME_REGEX,
  },
	// The variable name of the base class this level is attached to
	baseClass: {
		type: String,
		regEx: VARIABLE_NAME_REGEX,
		optional: true,
	},
	level: {
    type: SimpleSchema.Integer,
		defaultValue: 1,
  },
});

ClassLevels.attachSchema(ClassLevelSchema);
ClassLevels.attachSchema(PropertySchema);

// Todo ensure the class level is being parented to a compatible class, and that
// previous level requirements are met
const insertClassLevel = new ValidatedMethod({
  name: 'ClassLevels.methods.insert',
	mixins: [
    creaturePermissionMixin,
    setDocAncestryMixin,
    ensureAncestryContainsCharIdMixin,
		setDocToLastMixin,
    simpleSchemaMixin,
  ],
  collection: ClassLevels,
  permission: 'edit',
  schema: ClassLevelSchema,
  run(classLevel) {
		return ClassLevels.insert(classLevel);
  },
});

const updateClassLevel = new ValidatedMethod({
  name: 'ClassLevels.methods.update',
  mixins: [
		propagateInheritanceUpdateMixin,
    updateSchemaMixin,
    creaturePermissionMixin,
  ],
  collection: ClassLevels,
  permission: 'edit',
  schema: ClassLevelSchema,
});

export default ClassLevels;
export { ClassLevelSchema, insertClassLevel, updateClassLevel };

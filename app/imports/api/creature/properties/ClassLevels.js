import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX.js';

// Mixins
import creaturePermissionMixin from '/imports/api/mixins/creaturePermissionMixin.js';
import { setDocToLastMixin } from '/imports/api/mixins/setDocToLastMixin.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/mixins/simpleSchemaMixin.js';
import propagateInheritanceUpdateMixin from '/imports/api/mixins/propagateInheritanceUpdateMixin.js';
import updateSchemaMixin from '/imports/api/mixins/updateSchemaMixin.js';

let ClassLevels = new Mongo.Collection("classLevels");

let ClassLevelSchema = schema({
	name: {
		type: String,
		optional: true,
	},
	enabled: {
    type: Boolean,
    defaultValue: true,
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
	},
	// The name of the class level that needs to preceed this class level
	// So a totemWarrior level 5 must be preceded by a totemWarrior level 4
	// If it's not set, any level below with the same baseClass is matched
	previousClassLevel: {
		type: String,
		regEx: VARIABLE_NAME_REGEX,
		optional: true,
	},
	level: {
    type: SimpleSchema.Integer,
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

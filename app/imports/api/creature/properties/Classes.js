import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import { PropertySchema } from '/imports/api/creature/properties/Properties.js'
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX.js';

// Mixins
import creaturePermissionMixin from '/imports/api/creature/mixins/creaturePermissionMixin.js';
import { setDocToLastMixin } from '/imports/api/creature/mixins/setDocToLastMixin.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/creature/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/creature/mixins/simpleSchemaMixin.js';
import propagateInheritanceUpdateMixin from '/imports/api/creature/mixins/propagateInheritanceUpdateMixin.js';
import updateSchemaMixin from '/imports/api/creature/mixins/updateSchemaMixin.js';

let Classes = new Mongo.Collection("classes");

// TODO use variable name in computation engine, rather than a generated one
let ClassSchema = schema({
  name: {
		type: String,
		optional: true,
	},
  variableName: {
    type: String,
		regEx: VARIABLE_NAME_REGEX,
  },
});

ClassSchema.extend(ColorSchema);

Classes.attachSchema(ClassSchema);
Classes.attachSchema(PropertySchema);

const insertClass = new ValidatedMethod({
  name: 'Classes.methods.insert',
	mixins: [
    creaturePermissionMixin,
    setDocAncestryMixin,
    ensureAncestryContainsCharIdMixin,
    setDocToLastMixin,
    simpleSchemaMixin,
  ],
  collection: Classes,
  permission: 'edit',
  schema: ClassSchema,
  run(cls) {
		return Classes.insert(cls);
  },
});

const updateClass = new ValidatedMethod({
  name: 'Classes.methods.update',
  mixins: [
    propagateInheritanceUpdateMixin,
    updateSchemaMixin,
    creaturePermissionMixin,
  ],
  collection: Classes,
  permission: 'edit',
  schema: ClassSchema,
});

export default Classes;
export { ClassSchema, insertClass, updateClass };

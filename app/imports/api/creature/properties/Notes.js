import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";
import { PropertySchema } from '/imports/api/creature/properties/Properties.js'

// Mixins
import creaturePermissionMixin from '/imports/api/creature/mixins/creaturePermissionMixin.js';
import { setDocToLastMixin } from '/imports/api/creature/mixins/setDocToLastMixin.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/creature/mixins/simpleSchemaMixin.js';
import propagateInheritanceUpdateMixin from '/imports/api/creature/mixins/propagateInheritanceUpdateMixin.js';
import updateSchemaMixin from '/imports/api/creature/mixins/updateSchemaMixin.js';

let Notes = new Mongo.Collection("notes");

let NoteSchema = schema({
	name: {
		type: String,
		optional: true,
	},
	description: {
		type: String,
		optional: true,
	},
});

NoteSchema.extend(ColorSchema);

Notes.attachSchema(NoteSchema);
Notes.attachSchema(PropertySchema);

const insertNote = new ValidatedMethod({
  name: 'Notes.methods.insert',
	mixins: [
    creaturePermissionMixin,
    setDocAncestryMixin,
    ensureAncestryContainsCharIdMixin,
		setDocToLastMixin,
    simpleSchemaMixin,
  ],
  collection: Notes,
  permission: 'edit',
  schema: NoteSchema,
  run(note) {
		return Notes.insert(note);
  },
});

const updateNote = new ValidatedMethod({
  name: 'Notes.methods.update',
  mixins: [
		propagateInheritanceUpdateMixin,
    updateSchemaMixin,
    creaturePermissionMixin,
  ],
  collection: Notes,
  permission: 'edit',
  schema: NoteSchema,
});

export default Notes;
export { NoteSchema, insertNote, updateNote };

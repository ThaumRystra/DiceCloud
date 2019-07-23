import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import { PropertySchema } from '/imports/api/creature/properties/Properties.js'

// Mixins
import creaturePermissionMixin from '/imports/api/creature/mixins/creaturePermissionMixin.js';
import { setDocToLastMixin } from '/imports/api/creature/mixins/setDocToLastMixin.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/creature/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/creature/mixins/simpleSchemaMixin.js';
import propagateInheritanceUpdateMixin from '/imports/api/creature/mixins/propagateInheritanceUpdateMixin.js';
import updateSchemaMixin from '/imports/api/creature/mixins/updateSchemaMixin.js';

let Folders = new Mongo.Collection('folders');

// Folders organize a character sheet into a tree, particularly to group things
// like 'race' and 'background'
let FolderSchema = schema({
  name: {
    type: String,
  },
});

Folders.attachSchema(FolderSchema);
Folders.attachSchema(PropertySchema);

const insertFolder = new ValidatedMethod({
  name: 'Folders.methods.insert',
	mixins: [
    creaturePermissionMixin,
    setDocAncestryMixin,
    ensureAncestryContainsCharIdMixin,
    setDocToLastMixin,
    simpleSchemaMixin,
  ],
  collection: Folders,
  permission: 'edit',
  schema: FolderSchema,
  run(folder) {
		return Folders.insert(folder);
  },
});

const updateFolder = new ValidatedMethod({
  name: 'Folders.methods.update',
  mixins: [
    propagateInheritanceUpdateMixin,
    updateSchemaMixin,
    creaturePermissionMixin,
  ],
  collection: Folders,
  permission: 'edit',
  schema: FolderSchema,
});

export default Folders;
export { FolderSchema, insertFolder, updateFolder };

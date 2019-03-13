import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';

// Mixins
import { creaturePermissionMixin } from '/imports/api/creature/creaturePermissions.js';
import { setDocToLastMixin } from '/imports/api/order.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/simpleSchemaMixin.js';

let Folders = new Mongo.Collection('folders');

let FolderSchema = schema({
  name: {
    type: String,
    optional: true,
  },
});

Folders.attachSchema(FolderSchema);
Folders.attachSchema(PropertySchema);
Folders.attachSchema(ChildSchema);

const insertFolder = new ValidatedMethod({
  name: 'Folders.methods.insert',
	mixins: [
    creaturePermissionMixin,
    setDocToLastMixin,
    setDocAncestryMixin,
    ensureAncestryContainsCharIdMixin,
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
    creaturePermissionMixin,
    simpleSchemaMixin,
  ],
  collection: Folders,
  permission: 'edit',
  schema: new SimpleSchema({
    _id: SimpleSchema.RegEx.Id,
    update: FolderSchema.omit('name'),
  }),
  run({_id, update}) {
		return Folders.update(_id, {$set: update});
  },
});

export default Folders;
export { FolderSchema, insertFolder, updateFolder };

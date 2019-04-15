import schema from '/imports/api/schema.js';
import ChildSchema from '/imports/api/creature/parenting/ChildSchema.js';
import librarySchemas from '/imports/api/library/librarySchemas.js';
import Libraries from '/imports/api/library/Libraries.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import getModifierFields from '/imports/api/getModifierFields.js';

let LibraryNodes = new Mongo.Collection('libraryNodes');

const RefSchema = new SimpleSchema({
  id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1
  },
});

let LibraryNodeSchema = schema({
	name: {
		type: String,
		optional: true,
	},
	libraryNodeType: {
    type: String,
    allowedValues: Object.keys(librarySchemas),
  },
	order: {
  	type: SimpleSchema.Integer,
  	index: true,
  },
	parent: {
    type: RefSchema,
  },
	// ancestors[0] should be the library to check for permission
  ancestors: {
    type: Array,
    defaultValue: [],
  },
  'ancestors.$': {
    type: RefSchema,
  },
});

for (let key in librarySchemas){
	let schema = new SimpleSchema({});
	schema.extend(librarySchemas[key]);
	schema.extend(LibraryNodeSchema);
	schema.extend(ChildSchema);
	LibraryNodes.attachSchema(schema, {
		selector: {libraryNodeType: key}
	});
}

export default LibraryNodes;
export { LibraryNodeSchema };

function getLibrary(node){
  if (!node) throw new Meteor.Error('No node provided');
  return Libraries.findOne(node.ancestors[0].id);
}

function assertNodeEditPermission(node, userId){
  let lib = getLibrary(node);
  return assertEditPermission(lib, userId);
}

const updateNode = new ValidatedMethod({
  name: 'LibraryNodes.methods.update',
  validate({_id, update}){
    let fields = getModifierFields(update);
    return !fields.hasAny([
      'libraryNodeType',
      'order',
      'parent',
      'ancestors',
    ]);
  },
  run({_id, update}) {
    let node = LibraryNodes.findOne(_id);
    assertNodeEditPermission(node, this.userId);
		return LibraryNodes.update(_id, update);
  },
});

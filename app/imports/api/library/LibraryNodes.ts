import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import ColorSchema from '/imports/api/properties/subSchemas/ColorSchema';
import ChildSchema, { RefSchema } from '/imports/api/parenting/ChildSchema';
import propertySchemasIndex from '/imports/api/properties/propertySchemasIndex';
import Libraries from '/imports/api/library/Libraries';
import { assertDocEditPermission, assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import { softRemove } from '/imports/api/parenting/softRemove';
import SoftRemovableSchema from '/imports/api/parenting/SoftRemovableSchema';
import { storedIconsSchema } from '/imports/api/icons/Icons';
import '/imports/api/library/methods/index';
import { updateReferenceNodeWork } from '/imports/api/library/methods/updateReferenceNode';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { restore } from '/imports/api/parenting/softRemove';
import { fetchDocByRef } from '/imports/api/parenting/parentingFunctions';
import { rebuildNestedSets } from '/imports/api/parenting/parentingFunctions';
import { ConvertToUnion, InferType, TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';
import type { PropertyType } from '/imports/api/properties/PropertyType.type';
import { Simplify } from 'type-fest';

const LibraryNodeSchema = TypedSimpleSchema.from({
  _id: {
    type: String,
    max: 32,
  },
  type: {
    type: String,
    allowedValues: Object.keys(propertySchemasIndex),
  },
  tags: {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.tagCount,
  },
  'tags.$': {
    type: String,
    max: STORAGE_LIMITS.tagLength,
  },
  icon: {
    type: storedIconsSchema,
    optional: true,
    max: STORAGE_LIMITS.icon,
  },

  // Library-specific properties, these can be stripped from the resulting
  // creature properties

  // Will this property show up in the slot-fill dialog
  fillSlots: {
    type: Boolean,
    optional: true,
  },
  // Will this property show up in the insert-from-library dialog
  searchable: {
    type: Boolean,
    optional: true,
  },
  libraryTags: {
    type: Array,
    optional: true,
    maxCount: STORAGE_LIMITS.tagCount,
  },
  'libraryTags.$': {
    type: String,
    max: STORAGE_LIMITS.tagLength,
  },
  // Overrides the type when searching for properties
  slotFillerType: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.variableName,
  },
  // Image to display when filling the slot
  slotFillImage: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.url,
  },
  // Fill more than one quantity in a slot, like feats and ability score
  // improvements, filtered out of UI if there isn't space in quantityExpected
  slotQuantityFilled: {
    type: SimpleSchema.Integer,
    optional: true, // Undefined implies 1
  },
  // Filters out of UI if condition isn't met, but isn't otherwise enforced
  slotFillerCondition: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.calculation,
  },
  // Text to display if slot filler condition fails
  slotFillerConditionNote: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.calculation,
  },
});

export type LibraryNodeTypes = {
  [T in PropertyType]: Simplify<
    { type: T }
    & InferType<typeof propertySchemasIndex[T]>
  > & Simplify<
    Exclude<InferType<typeof LibraryNodeSchema>, 'type'>
    & InferType<typeof ColorSchema>
    & InferType<typeof ChildSchema>
    & InferType<typeof SoftRemovableSchema>
  >
}

export type LibraryNode = ConvertToUnion<LibraryNodeTypes>;

const LibraryNodes = new Mongo.Collection<LibraryNode>('libraryNodes');

// Set up server side search index
if (Meteor.isServer) {
  LibraryNodes.createIndexAsync({
    'name': 'text',
    'tags': 'text',
  });
}

const genericLibraryNodeSchema = TypedSimpleSchema.from({})
  .extend(LibraryNodeSchema)
  .extend(ColorSchema)
  .extend(ChildSchema)
  .extend(SoftRemovableSchema);

// Attach the default schema
LibraryNodes.attachSchema(genericLibraryNodeSchema);

// Attach the schemas for each type
let key: keyof typeof propertySchemasIndex;
for (key in propertySchemasIndex) {
  const schema = TypedSimpleSchema.from({})
    .extend(propertySchemasIndex[key])
    .extend(genericLibraryNodeSchema);
  LibraryNodes.attachSchema(schema, {
    selector: { type: key }
  });
}

const insertNode = new ValidatedMethod({
  name: 'libraryNodes.insert',
  validate: new SimpleSchema({
    libraryNode: {
      type: Object,
      blackbox: true,
    },
    parentRef: RefSchema,
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ libraryNode, parentRef }) {
    // get the new ancestry
    const parentDoc = fetchDocByRef(parentRef);

    // Check permission to edit
    let rootLibrary;
    if (parentRef.collection === 'libraries') {
      rootLibrary = parentDoc;
    } else if (parentRef.collection === 'libraryNodes') {
      rootLibrary = await Libraries.findOneAsync(parentDoc.root.id);
      libraryNode.parentId = parentRef.id;
    } else {
      throw `${parentRef.collection} is not a valid parent collection`
    }
    await assertEditPermission(rootLibrary, this.userId);

    // Set the root of the node we are inserting
    libraryNode.root = { collection: 'libraries', id: rootLibrary._id };

    // Remove its ID if it came with one to force a random one to be generated
    // server-side
    delete libraryNode._id;

    // Insert the node
    const nodeId = await LibraryNodes.insertAsync(libraryNode);

    // Update the node if it was a reference node
    if (libraryNode.type == 'reference') {
      libraryNode._id = nodeId;
      updateReferenceNodeWork(libraryNode, this.userId);
    }

    // Tree structure changed by insert, reorder the tree
    await rebuildNestedSets(LibraryNodes, rootLibrary._id);

    // Return the id of the inserted node
    return nodeId;
  },
});

const updateLibraryNode = new ValidatedMethod({
  name: 'libraryNodes.update',
  validate({ _id, path }) {
    if (!_id) return false;
    // We cannot change these fields with a simple update
    switch (path[0]) {
      case 'type':
      case 'root':
      case 'left':
      case 'right':
      case 'parentId':
        return false;
    }
  },
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 15,
    timeInterval: 5000,
  },
  async run({ _id, path, value }) {
    let node = await LibraryNodes.findOneAsync(_id);
    await assertDocEditPermission(node, this.userId);
    const pathString = path.join('.');
    let modifier;
    // unset empty values
    if (value === null || value === undefined) {
      modifier = { $unset: { [pathString]: 1 } };
    } else {
      modifier = { $set: { [pathString]: value } };
    }
    const numUpdated = await LibraryNodes.updateAsync(_id, modifier, {
      selector: { type: node.type },
    });
    if (node.type == 'reference') {
      node = await LibraryNodes.findOneAsync(_id);
      updateReferenceNodeWork(node, this.userId);
    }
    return numUpdated;
  },
});

const pushToLibraryNode = new ValidatedMethod({
  name: 'libraryNodes.push',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ _id, path, value }) {
    const node = await LibraryNodes.findOneAsync(_id);
    await assertDocEditPermission(node, this.userId);
    return await LibraryNodes.updateAsync(_id, {
      $push: { [path.join('.')]: value },
    }, {
      selector: { type: node.type },
    });
  }
});

const pullFromLibraryNode = new ValidatedMethod({
  name: 'libraryNodes.pull',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ _id, path, itemId }) {
    const node = await LibraryNodes.findOneAsync(_id);
    await assertDocEditPermission(node, this.userId);
    return await LibraryNodes.updateAsync(_id, {
      $pull: { [path.join('.')]: { _id: itemId } },
    }, {
      selector: { type: node.type },
      getAutoValues: false,
    });
  }
});

const softRemoveLibraryNode = new ValidatedMethod({
  name: 'libraryNodes.softRemove',
  validate: new SimpleSchema({
    _id: SimpleSchema.RegEx.Id
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ _id }) {
    const node = await LibraryNodes.findOneAsync(_id);
    await assertDocEditPermission(node, this.userId);
    softRemove(LibraryNodes, node);
  }
});

const restoreLibraryNode = new ValidatedMethod({
  name: 'libraryNodes.restore',
  validate: new SimpleSchema({
    _id: SimpleSchema.RegEx.Id
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ _id }) {
    // Permissions
    const node = await LibraryNodes.findOneAsync(_id);
    if (!node) return;
    await assertDocEditPermission(node, this.userId);
    // Do work
    restore(LibraryNodes, node);
  }
});

export default LibraryNodes;
export {
  LibraryNodeSchema,
  insertNode,
  updateLibraryNode,
  pullFromLibraryNode,
  pushToLibraryNode,
  softRemoveLibraryNode,
  restoreLibraryNode,
};

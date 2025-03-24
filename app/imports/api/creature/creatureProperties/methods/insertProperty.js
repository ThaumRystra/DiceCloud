import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor';
import SimpleSchema from 'simpl-schema';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import { fetchDocByRef, rebuildNestedSets } from '/imports/api/parenting/parentingFunctions';
import getParentRefByTag from './getParentByTag';
import { RefSchema } from '/imports/api/parenting/ChildSchema';

const insertProperty = new ValidatedMethod({
  name: 'creatureProperties.insert',
  validate: new SimpleSchema({
    creatureProperty: {
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
  run({ creatureProperty, parentRef }) {
    let rootCreature;
    const parentDoc = fetchDocByRef(parentRef);

    // Check permission to edit
    if (parentRef.collection === 'creatures') {
      rootCreature = parentDoc;
    } else if (parentRef.collection === 'creatureProperties') {
      rootCreature = getRootCreatureAncestor(parentDoc);
      creatureProperty.parentId = parentDoc._id;
    } else {
      throw `${parentRef.collection} is not a valid parent collection`
    }
    assertEditPermission(rootCreature, this.userId);

    creatureProperty.root = { collection: 'creatures', id: rootCreature._id };

    return insertPropertyWork(creatureProperty);
  },
});

const insertPropertyAsChildOfTag = new ValidatedMethod({
  name: 'creatureProperties.insertAsChildOfTag',
  validate: new SimpleSchema({
    creatureProperty: {
      type: Object,
      blackbox: true,
    },
    creatureId: {
      type: String,
      max: 32,
    },
    tag: {
      type: String,
      max: 20,
    },
    tagDefaultName: {
      type: String,
      max: 20,
      optional: true,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ creatureProperty, creatureId, tag, tagDefaultName }) {
    let parentRef = getParentRefByTag(creatureId, tag);
    let insertFolderFirst = false;

    if (!parentRef) {
      // Use the creature as the parent and mark that we need to insert the folder first later
      insertFolderFirst = true;
      parentRef = { id: creatureId, collection: 'creatures' };
    }

    // Check permission to edit
    let rootCreature;
    const parentDoc = fetchDocByRef(parentRef);
    if (parentRef.collection === 'creatures') {
      rootCreature = parentDoc;
    } else if (parentRef.collection === 'creatureProperties') {
      rootCreature = getRootCreatureAncestor(parentDoc);
    } else {
      throw `${parentRef.collection} is not a valid parent collection`
    }
    assertEditPermission(rootCreature, this.userId);

    const root = { collection: 'creatures', id: rootCreature._id };

    // Add the folder first if we need to
    if (insertFolderFirst) {
      let id = CreatureProperties.insert({
        type: 'folder',
        name: tagDefaultName || (tag.charAt(0).toUpperCase() + tag.slice(1)),
        tags: [tag],
        // parentId: undefined,
        root,
      });
      // Make the folder our new parent
      parentRef = { id, collection: 'creatureProperties' };
    }

    creatureProperty.root = root;
    creatureProperty.parentId = parentRef.id;

    return insertPropertyWork(creatureProperty);
  },
});

export function insertPropertyWork(property) {
  delete property._id;
  property.dirty = true;
  let _id = CreatureProperties.insert(property);
  // Tree structure changed by insert, reorder the tree
  rebuildNestedSets(CreatureProperties, property.root.id);
  return _id;
}

export default insertProperty;
export { insertPropertyAsChildOfTag };

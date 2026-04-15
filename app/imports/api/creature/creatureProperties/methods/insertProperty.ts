import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties, { type CreatureProperty } from '/imports/api/creature/creatureProperties/CreatureProperties';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor';
import SimpleSchema from 'simpl-schema';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import { fetchDocByRefAsync, rebuildNestedSets } from '/imports/api/parenting/parentingFunctions';
import getParentByTag from './getParentByTag';
import { RefSchema, type Reference, type TreeDoc } from '/imports/api/parenting/ChildSchema';
import type { Creature } from '/imports/api/creature/creatures/Creatures';

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
  async run({ creatureProperty, parentRef }: {
    creatureProperty: Partial<CreatureProperty>,
    parentRef: Reference,
  }) {
    let rootCreature: Creature | undefined;
    const parentDoc = await fetchDocByRefAsync<TreeDoc | Creature>(parentRef);

    // Check permission to edit
    if (parentRef.collection === 'creatures' && 'owner' in parentDoc) {
      rootCreature = parentDoc;
    } else if (parentRef.collection === 'creatureProperties' && 'root' in parentDoc) {
      rootCreature = getRootCreatureAncestor(parentDoc);
      creatureProperty.parentId = parentDoc._id;
    }

    if (!rootCreature) {
      throw new Meteor.Error('invalid-collection',
        `${parentRef.collection} is not a valid parent collection`
      );
    }
    await assertEditPermission(rootCreature, this.userId);

    creatureProperty.root = { collection: 'creatures', id: rootCreature._id };

    return await insertPropertyWork(creatureProperty);
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
  async run({ creatureProperty, creatureId, tag, tagDefaultName }: {
    creatureProperty: Partial<CreatureProperty>;
    creatureId: string;
    tag: string;
    tagDefaultName: string;
  }) {
    const parent = await getParentByTag(creatureId, tag);
    let insertFolderFirst = false;

    let parentRef;
    if (parent) {
      parentRef = { id: parent._id, collection: 'creatureProperties' };
    } else {
      // Use the creature as the parent and mark that we need to insert the folder first later
      insertFolderFirst = true;
      parentRef = { id: creatureId, collection: 'creatures' };
    }

    // Check permission to edit
    let rootCreature;
    const parentDoc = await fetchDocByRefAsync(parentRef);
    if (parentRef.collection === 'creatures') {
      rootCreature = parentDoc;
    } else if (parentRef.collection === 'creatureProperties') {
      rootCreature = getRootCreatureAncestor(parentDoc);
    } else {
      throw `${parentRef.collection} is not a valid parent collection`
    }
    await assertEditPermission(rootCreature, this.userId);

    const root = { collection: 'creatures', id: rootCreature._id };

    // Add the folder first if we need to
    if (insertFolderFirst) {
      const id = await CreatureProperties.insertAsync({
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

    return await insertPropertyWork(creatureProperty);
  },
});

export async function insertPropertyWork(property) {
  delete property._id;
  property.dirty = true;
  const _id = await CreatureProperties.insertAsync(property);
  // Tree structure changed by insert, reorder the tree
  await rebuildNestedSets(CreatureProperties, property.root.id);
  return _id;
}

export default insertProperty;
export { insertPropertyAsChildOfTag };

import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties, { type CreatureProperty } from '/imports/api/creature/creatureProperties/CreatureProperties';
import SimpleSchema from 'simpl-schema';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import { rebuildNestedSets } from '/imports/api/parenting/parentingFunctions';
import getParentByTag from './getParentByTag';
import { getDocByRefAsync } from '/imports/api/parenting/reference';

const insertProperty = new ValidatedMethod({
  name: 'creatureProperties.insert',
  validate: new SimpleSchema({
    creatureProperty: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ creatureProperty }: {
    creatureProperty: Partial<CreatureProperty>,
  }) {
    if (!creatureProperty.root) {
      throw new Meteor.Error('no-root-set', 'A property must be inserted with a root already set');
    }
    const rootDoc = await getDocByRefAsync(creatureProperty.root);

    if (!rootDoc) {
      throw new Meteor.Error('not-found',
        'Could not find the root to insert this property into'
      );
    }
    await assertEditPermission(rootDoc, this.userId);
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
  async run({ creatureProperty, tag, tagDefaultName }: {
    creatureProperty: Partial<CreatureProperty>;
    tag: string;
    tagDefaultName: string;
  }) {
    if (!creatureProperty.root) {
      throw new Meteor.Error('no-root-set', 'A property must be inserted with a root already set');
    }
    const rootDoc = await getDocByRefAsync(creatureProperty.root);

    if (!rootDoc) {
      throw new Meteor.Error('not-found',
        'Could not find the root to insert this property into'
      );
    }
    await assertEditPermission(rootDoc, this.userId);

    let parent = await getParentByTag(rootDoc._id, tag);

    // Add the folder first if we need to
    if (!parent) {
      const id = await CreatureProperties.insertAsync({
        type: 'folder',
        name: tagDefaultName || (tag.charAt(0).toUpperCase() + tag.slice(1)),
        tags: [tag],
        // parentId: undefined,
        root: creatureProperty.root,
        left: 0.5,
        right: 0.5,
      });
      parent = await CreatureProperties.findOneAsync(id);
    }
    if (!parent) {
      throw new Meteor.Error('no-folder-with-tag', `The folder with the tag '${tag}' could not be found or created`);
    }
    creatureProperty.parentId = parent._id;

    return await insertPropertyWork(creatureProperty);
  },
});

export async function insertPropertyWork(property: Partial<CreatureProperty>) {
  if (!property.root?.id) throw new Meteor.Error('no-orphans', 'Can\'t insert a property without a root')
  delete property._id;
  property.dirty = true;
  const _id = await CreatureProperties.insertAsync(property as CreatureProperty);
  // Tree structure changed by insert, reorder the tree
  await rebuildNestedSets(CreatureProperties, property.root.id);
  return _id;
}

export default insertProperty;
export { insertPropertyAsChildOfTag };

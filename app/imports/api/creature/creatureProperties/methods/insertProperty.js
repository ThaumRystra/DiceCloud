import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import SimpleSchema from 'simpl-schema';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import { reorderDocs } from '/imports/api/parenting/order.js';
import { getAncestry } from '/imports/api/parenting/parenting.js';
import getParentRefByTag from '/imports/api/creature/creatureProperties/methods/getParentRefByTag.js';
import { RefSchema } from '/imports/api/parenting/ChildSchema.js';
import { getHighestOrder } from '/imports/api/parenting/order.js';

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
    // get the new ancestry for the properties
    let { parentDoc, ancestors } = getAncestry({ parentRef });

    // Check permission to edit
    let rootCreature;
    if (parentRef.collection === 'creatures') {
      rootCreature = parentDoc;
    } else if (parentRef.collection === 'creatureProperties') {
      rootCreature = getRootCreatureAncestor(parentDoc);
    } else {
      throw `${parentRef.collection} is not a valid parent collection`
    }
    assertEditPermission(rootCreature, this.userId);

    creatureProperty.parent = parentRef;
    creatureProperty.ancestors = ancestors;

    return insertPropertyWork({
      property: creatureProperty,
      creature: rootCreature,
    });
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
      regEx: SimpleSchema.RegEx.Id,
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

    if (!parentRef) {
      // Use the creature as the parent and mark that we need to insert the folder first later
      var insertFolderFirst = true;
      parentRef = { id: creatureId, collection: 'creatures' };
    }

    // get the new ancestry for the properties
    let { parentDoc, ancestors } = getAncestry({ parentRef });

    // Check permission to edit
    let rootCreature;
    if (parentRef.collection === 'creatures') {
      rootCreature = parentDoc;
    } else if (parentRef.collection === 'creatureProperties') {
      rootCreature = getRootCreatureAncestor(parentDoc);
    } else {
      throw `${parentRef.collection} is not a valid parent collection`
    }
    assertEditPermission(rootCreature, this.userId);

    // Add the folder first if we need to
    if (insertFolderFirst) {
      let order = getHighestOrder({
        collection: CreatureProperties,
        ancestorId: parentRef.id,
      }) + 1;
      let id = CreatureProperties.insert({
        type: 'folder',
        name: tagDefaultName || (tag.charAt(0).toUpperCase() + tag.slice(1)),
        tags: [tag],
        parent: parentRef,
        ancestors: [parentRef],
        order,
      });
      // Make the folder our new parent
      let newParentRef = { id, collection: 'creatureProperties' };
      ancestors = [parentRef, newParentRef];
      parentRef = newParentRef;
      creatureProperty.order = order + 1;
    }

    creatureProperty.parent = parentRef;
    creatureProperty.ancestors = ancestors;

    return insertPropertyWork({
      property: creatureProperty,
      creature: rootCreature,
    });
  },
});

export function insertPropertyWork({ property, creature }) {
  delete property._id;
  property.dirty = true;
  let _id = CreatureProperties.insert(property);
  // Tree structure changed by insert, reorder the tree
  reorderDocs({
    collection: CreatureProperties,
    ancestorId: creature._id,
  });
  return _id;
}

export default insertProperty;
export { insertPropertyAsChildOfTag };

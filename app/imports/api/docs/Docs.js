import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import { softRemove } from '/imports/api/parenting/softRemove.js';
import SoftRemovableSchema from '/imports/api/parenting/SoftRemovableSchema.js';
import { storedIconsSchema } from '/imports/api/icons/Icons.js';
import '/imports/api/library/methods/index.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';
import { restore } from '/imports/api/parenting/softRemove.js';
import { reorderDocs } from '/imports/api/parenting/order.js';
import { getAncestry } from '/imports/api/parenting/parenting.js';

const Docs = new Mongo.Collection('docs');

const RefSchema = new SimpleSchema({
  id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1
  },
  collection: {
    type: String,
    max: STORAGE_LIMITS.collectionName,
  },
  urlName: {
    type: String,
    regEx: /[a-z]+(?:[a-z]|-)+/,
    min: 2,
    max: STORAGE_LIMITS.variableName,
    optional: true,
  },
  name: {
    type: String,
    max: STORAGE_LIMITS.description,
    optional: true,
  },
});

let ChildSchema = new SimpleSchema({
  order: {
    type: Number,
  },
  parent: {
    type: RefSchema,
    optional: true,
  },
  ancestors: {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.ancestorCount,
  },
  'ancestors.$': {
    type: RefSchema,
  },
});

let DocSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  name: {
    type: String,
    max: STORAGE_LIMITS.description,
  },
  urlName: {
    type: String,
    regEx: /[a-z]+(?:[a-z]|-)+/,
    min: 2,
    max: STORAGE_LIMITS.variableName,
  },
  href: {
    type: String,
  },
  description: {
    type: String,
    optional: true,
  },
  published: {
    type: Boolean,
    optional: true,
  },
  icon: {
    type: storedIconsSchema,
    optional: true,
    max: STORAGE_LIMITS.icon,
  },
});

let schema = new SimpleSchema({});
schema.extend(DocSchema);
schema.extend(ChildSchema);
schema.extend(SoftRemovableSchema);
Docs.attachSchema(schema);

function assertDocsEditPermission(userId) {
  if (!userId || typeof userId !== 'string') throw new Meteor.Error('No user id provided');
  const user = Meteor.users.findOne(userId);
  if (!user) throw new Meteor.Error('User does not exist');
  if (!user?.roles?.includes?.('docsWriter')) throw ('Permission denied')
}

function getDocLink(doc, urlName) {
  if (!urlName) urlName = doc.urlName;
  const address = ['/docs'];
  doc.ancestors?.forEach(a => {
    address.push(a.urlName);
  });
  address.push(urlName);
  return address.join('/');
}

function rebuildDocAncestors(docId) {
  const newDoc = Docs.findOne(docId);
  Docs.find({ 'ancestors.id': docId }).forEach(doc => {
    doc.ancestors.forEach((a, i) => {
      if (a.id === docId) {
        Docs.update(doc._id, {
          $set: {
            [`ancestors.${i}`]: {
              id: newDoc._id,
              collection: 'docs',
              urlName: newDoc.urlName,
              name: newDoc.name,
            }
          }
        });
      }
    });
    doc = Docs.findOne(doc._id);
    const newLink = getDocLink(doc);
    if (doc.href !== newLink) {
      Docs.update(doc._id, { $set: { href: newLink } })
    }
  });
}

// Add a means of seeding new servers with documentation
if (Meteor.isClient) {
  Docs.getJsonDocs = function () {
    return JSON.stringify(Docs.find({}).fetch(), null, 2);
  }
} else if (Meteor.isServer) {
  Meteor.startup(() => {
    if (!Docs.findOne()) {
      Assets.getText('docs/defaultDocs.json', (error, string) => {
        const docs = JSON.parse(string)
        docs.forEach(doc => Docs.insert(doc));
      });
    }
  });
}

const insertDoc = new ValidatedMethod({
  name: 'docs.insert',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ doc, parentRef }) {
    delete doc._id;
    assertDocsEditPermission(this.userId);
    // get the new ancestry for the properties
    if (parentRef) {
      var { ancestors } = getAncestry({
        parentRef,
        inheritedFields: { name: 1, urlName: 1 },
      });
    }
    doc.parent = parentRef;
    doc.ancestors = ancestors;

    const lastOrder = Docs.find({}, { sort: { order: -1 } }).fetch()[0]?.order || 0;
    doc.order = lastOrder + 1;
    doc.urlName = 'new-doc-' + (lastOrder + 1);

    doc.href = getDocLink(doc);
    if (Docs.findOne({ href: doc.href })) {
      throw new Meteor.Error('Link collision', 'A document with the same URL already exists');
    }

    const docId = Docs.insert(doc);
    reorderDocs({
      collection: Docs,
      ancestorId: 'root',
    });
    return docId;
  },
});

const updateDoc = new ValidatedMethod({
  name: 'docs.update',
  validate({ _id, path }) {
    if (!_id) return false;
    // We cannot change these fields with a simple update
    switch (path[0]) {
      case '_is':
        return false;
    }
  },
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ _id, path, value }) {
    assertDocsEditPermission(this.userId);
    let pathString = path.join('.');
    let modifier;
    // unset empty values
    if (value === null || value === undefined) {
      modifier = { $unset: { [pathString]: 1 } };
    } else {
      modifier = { $set: { [pathString]: value } };
    }
    if (pathString === 'urlName') {
      const doc = Docs.findOne(_id);
      const newLink = getDocLink(doc, value);
      if (Docs.findOne({ href: newLink })) {
        throw new Meteor.Error('Link collision', 'A document with the same URL already exists');
      }
      modifier.$set = modifier.$set || {};
      modifier.$set.href = newLink;
      rebuildDocAncestors(_id);
    }
    const updates = Docs.update(_id, modifier);
    if (pathString === 'name' || pathString === 'urlName') {
      rebuildDocAncestors(_id);
    }
    reorderDocs({
      collection: Docs,
      ancestorId: 'root',
    });
    return updates;
  },
});

const pushToDoc = new ValidatedMethod({
  name: 'docs.push',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ _id, path, value }) {
    assertDocsEditPermission(this.userId);
    return Docs.update(_id, {
      $push: { [path.join('.')]: value },
    });
  }
});

const pullFromDoc = new ValidatedMethod({
  name: 'docs.pull',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ _id, path, itemId }) {
    assertDocsEditPermission(this.userId);
    return Docs.update(_id, {
      $pull: { [path.join('.')]: { _id: itemId } },
    });
  }
});

const softRemoveDoc = new ValidatedMethod({
  name: 'docs.softRemove',
  validate: new SimpleSchema({
    _id: SimpleSchema.RegEx.Id
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ _id }) {
    assertDocsEditPermission(this.userId);
    softRemove({ _id, collection: Docs });
    reorderDocs({
      collection: Docs,
      ancestorId: 'root',
    });
  }
});

const restoreDoc = new ValidatedMethod({
  name: 'docs.restore',
  validate: new SimpleSchema({
    _id: SimpleSchema.RegEx.Id
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ _id }) {
    assertDocsEditPermission(this.userId);
    restore({ _id, collection: Docs });
    reorderDocs({
      collection: Docs,
      ancestorId: 'root',
    });
  }
});

export {
  DocSchema,
  insertDoc,
  updateDoc,
  pushToDoc,
  pullFromDoc,
  softRemoveDoc,
  restoreDoc,
};

export default Docs;

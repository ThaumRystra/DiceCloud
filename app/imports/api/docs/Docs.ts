import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import { softRemove } from '/imports/api/parenting/softRemove';
import SoftRemovableSchema from '/imports/api/parenting/SoftRemovableSchema';
import { storedIconsSchema } from '/imports/api/icons/Icons';
import '/imports/api/library/methods/index';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { restore } from '/imports/api/parenting/softRemove';
import { getFilter, rebuildNestedSets, moveDocWithinRoot } from '/imports/api/parenting/parentingFunctions';
import ChildSchema, { TreeDoc } from '/imports/api/parenting/ChildSchema';

// Give the docs a common root, so they can share parenting logic
export const DOC_ROOT_ID = 'DDDDDDDDDDDDDDDDD'

type Doc = {
  _id: string,
  name: string,
  urlName: string,
  href: string,
  description?: string,
  published?: true,
  icon?: {
    name: string,
    shape: string,
  },
} & TreeDoc;

const Docs: Mongo.Collection<Doc> & {
  getJsonDocs?: () => string
} = new Mongo.Collection<Doc>('docs');

const DocSchema = new SimpleSchema({
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

const schema = new SimpleSchema({});
schema.extend(DocSchema);
schema.extend(ChildSchema);
schema.extend(SoftRemovableSchema);
// @ts-expect-error No attach schema in types
Docs.attachSchema(schema);

function assertDocsEditPermission(userId) {
  if (!userId || typeof userId !== 'string') throw new Meteor.Error('No user id provided');
  const user = Meteor.users.findOne(userId);
  if (!user) throw new Meteor.Error('User does not exist');
  if (!user?.roles?.includes?.('docsWriter')) throw ('Permission denied')
}

function getDocLink(doc: Doc, urlName?: string) {
  if (!urlName) urlName = doc.urlName;
  const address = ['/docs'];
  const ancestorDocs = Docs.find(getFilter.ancestors(doc));
  ancestorDocs?.forEach(a => {
    address.push(a.urlName);
  });
  address.push(urlName);
  return address.join('/');
}

// Add a means of seeding new servers with documentation
if (Meteor.isClient) {
  Docs.getJsonDocs = function () {
    return JSON.stringify(Docs.find({}).fetch(), null, 2);
  }
} else if (Meteor.isServer) {
  Meteor.startup(() => {
    if (!Docs.findOne()) {
      console.log('No docs found, filling documentation with defaults');
      Assets.getText('docs/defaultDocs.json', (error, string) => {
        const docs = JSON.parse(string)
        docs.forEach(doc => Docs.insert(doc));
        rebuildNestedSets(Docs, DOC_ROOT_ID);
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
  run({ doc, parentId }) {
    delete doc._id;
    assertDocsEditPermission(this.userId);

    doc.parentId = parentId;
    doc.root = {
      collection: 'docs',
      id: DOC_ROOT_ID,
    };

    const lastOrder = Docs.find({}, { sort: { left: -1 }, limit: 1 }).fetch()[0]?.left || 0;
    doc.urlName = 'new-doc-' + (lastOrder + 1);
    doc.href = getDocLink(doc);
    if (Docs.findOne({ href: doc.href })) {
      throw new Meteor.Error('Link collision', 'A document with the same URL already exists');
    }

    const docId = Docs.insert(doc);
    rebuildNestedSets(Docs, DOC_ROOT_ID);
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
    const pathString = path.join('.');
    let modifier;
    // unset empty values
    if (value === null || value === undefined) {
      modifier = { $unset: { [pathString]: 1 } };
    } else {
      modifier = { $set: { [pathString]: value } };
    }
    if (pathString === 'urlName') {
      const doc = Docs.findOne(_id);
      if (!doc) throw new Meteor.Error('Not Found', 'The document you are trying to edit was not found');
      const newLink = getDocLink(doc, value);
      if (Docs.findOne({ href: newLink })) {
        throw new Meteor.Error('Link collision', 'A document with the same URL already exists');
      }
      modifier.$set = modifier.$set || {};
      modifier.$set.href = newLink;
    }
    const updates = Docs.update(_id, modifier);
    rebuildNestedSets(Docs, DOC_ROOT_ID);
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
    softRemove(Docs, _id);
    rebuildNestedSets(Docs, DOC_ROOT_ID);
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
    restore('docs', _id);
    rebuildNestedSets(Docs, DOC_ROOT_ID);
  }
});

const organizeDoc = new ValidatedMethod({
  name: 'docs.organizeDoc',
  validate: new SimpleSchema({
    docId: String,
    newPosition: Number,
    skipClient: {
      type: Boolean,
      optional: true,
    }
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ docId, newPosition, skipClient }: { docId: string, newPosition: number, skipClient?: boolean }) {
    if (skipClient && this.isSimulation) {
      return;
    }
    assertDocsEditPermission(this.userId);

    const doc = Docs.findOne(docId);
    if (!doc) throw new Meteor.Error('not found', 'The doc you are moving was not found');
    // Move the doc
    await moveDocWithinRoot(doc, Docs, newPosition);
  },
});

export {
  DocSchema,
  insertDoc,
  updateDoc,
  pushToDoc,
  pullFromDoc,
  softRemoveDoc,
  restoreDoc,
  organizeDoc,
};

export default Docs;

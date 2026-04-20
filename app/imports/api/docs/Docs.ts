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
import ChildSchema from '/imports/api/parenting/ChildSchema';
import { Roles } from 'meteor/roles';
import { TypedSimpleSchema, type InferType } from '/imports/api/utility/TypedSimpleSchema';

// Give the docs a common root, so they can share parenting logic
export const DOC_ROOT_ID = 'DDDDDDDDDDDDDDDDD'

const BaseDocSchema = TypedSimpleSchema.from({
  _id: {
    type: String,
    max: 32,
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

const DocSchema = TypedSimpleSchema.from({})
  .extend(BaseDocSchema)
  .extend(ChildSchema(['docs' as const]))
  .extend(SoftRemovableSchema);

export type Doc = InferType<typeof DocSchema>;

const Docs: Mongo.Collection<Doc> & {
  getJsonDocs?: () => string
} = new Mongo.Collection<Doc>('docs');

Docs.attachSchema(DocSchema);

async function assertDocsEditPermission(userId: string | null) {
  if (!userId || typeof userId !== 'string') throw new Meteor.Error('No user id provided');
  const canEdit = await Roles.userIsInRoleAsync(userId, 'DOCS_EDIT');
  if (!canEdit) {
    throw new Meteor.Error('permission-denied', 'You don\'t have permission to edit the docs');
  }
}

async function getDocLink(doc: Doc, urlName?: string) {
  if (!urlName) urlName = doc.urlName;
  const address = ['/docs'];
  const ancestorDocs = await Docs.find(getFilter.ancestors(doc)).fetchAsync();
  for (const a of ancestorDocs) {
    address.push(a.urlName);
  }
  address.push(urlName);
  return address.join('/');
}

// Add a means of seeding new servers with documentation
if (Meteor.isClient) {
  Docs.getJsonDocs = function () {
    return JSON.stringify(Docs.find({}).fetch(), null, 2);
  }
} else if (Meteor.isServer) {
  Meteor.startup(async () => {
    return;
    // TODO this is not working in current meteor
    if (!await Docs.findOneAsync()) {
      console.info('No docs found, filling documentation with defaults');
      const string = Assets.getText('docs/defaultDocs.json') ?? '[]';
      const docs = JSON.parse(string) as Doc[];
      for (const doc of docs) {
        await Docs.insertAsync(doc);
      }
      await rebuildNestedSets(Docs, DOC_ROOT_ID);
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
  async run({ doc, parentId }: { doc: Omit<Doc, '_id'>, parentId: string | undefined }) {
    await assertDocsEditPermission(this.userId);

    // @ts-expect-error _id shoudn't exist
    delete doc._id;
    doc.parentId = parentId;
    doc.root = {
      collection: 'docs',
      id: DOC_ROOT_ID,
    };

    const previousDoc = parentId
      ? await Docs.findOneAsync(parentId)
      : await Docs.findOneAsync({}, { sort: { left: -1 }, limit: 1 });
    const lastOrder = previousDoc?.left || 0;
    doc.urlName = 'new-doc-' + (lastOrder + 1);
    doc.href = await getDocLink(doc as Doc);
    doc.left = lastOrder + 0.5;
    doc.right = doc.left;
    if (await Docs.findOneAsync({ href: doc.href })) {
      throw new Meteor.Error('Link collision', 'A document with the same URL already exists');
    }

    const docId = await Docs.insertAsync(doc as Doc);
    await rebuildNestedSets(Docs, DOC_ROOT_ID);
    return docId;
  },
});

const updateDoc = new ValidatedMethod({
  name: 'docs.update',
  validate({ _id, path }: { _id: string, path: string[], value: unknown }) {
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
  async run({ _id, path, value }) {
    await assertDocsEditPermission(this.userId);
    const pathString = path.join('.');
    let modifier;
    // unset empty values
    if (value === null || value === undefined) {
      modifier = { $unset: { [pathString]: 1 } };
    } else {
      modifier = { $set: { [pathString]: value } };
    }
    if (pathString === 'urlName') {
      const doc = await Docs.findOneAsync(_id);
      if (!doc) throw new Meteor.Error('Not Found', 'The document you are trying to edit was not found');
      const newLink = await getDocLink(doc, value as string);
      if (await Docs.findOneAsync({ href: newLink })) {
        throw new Meteor.Error('Link collision', 'A document with the same URL already exists');
      }
      modifier.$set = modifier.$set || {};
      modifier.$set.href = newLink;
    }
    const updates = await Docs.updateAsync(_id, modifier);
    await rebuildNestedSets(Docs, DOC_ROOT_ID);
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
  async run({ _id, path, value }: { _id: string, path: string[], value: unknown }) {
    await assertDocsEditPermission(this.userId);
    return await Docs.updateAsync(_id, {
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
  async run({ _id, path, itemId }: { _id: string, path: string[], itemId: string }) {
    await assertDocsEditPermission(this.userId);
    return await Docs.updateAsync(_id, {
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
  async run({ _id }: { _id: string }) {
    await assertDocsEditPermission(this.userId);
    await softRemove(Docs, _id);
    await rebuildNestedSets(Docs, DOC_ROOT_ID);
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
  async run({ _id }: { _id: string }) {
    await assertDocsEditPermission(this.userId);
    await restore(Docs, _id);
    await rebuildNestedSets(Docs, DOC_ROOT_ID);
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
    await assertDocsEditPermission(this.userId);

    const doc = await Docs.findOneAsync(docId);
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

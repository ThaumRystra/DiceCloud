import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import LibraryNodes, { type LibraryNodeTypes } from '/imports/api/library/LibraryNodes';
import {
  assertDocEditPermission,
  assertDocExists,
  assertDocViewPermission,
  assertViewPermission,
} from '/imports/api/sharing/sharingPermissions';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';
import { getDocByRefAsync } from '/imports/api/parenting/reference';
import errorToString from '/imports/api/utility/errorToString';

const updateReferenceNode = new ValidatedMethod({
  name: 'libraryNodes.updateReferenceNode',
  validate: TypedSimpleSchema.from({
    _id: {
      type: String,
      max: 32,
    }
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ _id }) {
    const userId = this.userId;
    const node = await LibraryNodes.findOneAsync(_id);
    assertDocExists(node);
    await assertDocEditPermission(node, userId);
    if (node.type !== 'reference') {
      throw new Meteor.Error('unexpected-type', 'Updating a reference must be called with the ID of a reference property')
    }
    await updateReferenceNodeWork(node, userId);
  },
});

async function writeCache(_id: string, cache: LibraryNodeTypes['reference']['cache']) {
  await LibraryNodes.updateAsync(_id, { $set: { cache } }, {
    selector: { type: 'reference' },
  });
}

async function updateReferenceNodeWork(node: LibraryNodeTypes['reference'], userId: string | undefined | null) {
  let cache: LibraryNodeTypes['reference']['cache'] = {};
  if (!node.ref?.collection || !node.ref?.id) {
    await writeCache(node._id, cache);
    return;
  }
  let doc, library;
  try {
    doc = await getDocByRefAsync({ collection: node.ref.collection, id: node.ref.id });
    if (!doc) throw new Error('Property does not exist')
    if (doc.removed) throw new Error('Property has been deleted');
    if (doc.root.id !== node.root.id) {
      await assertDocViewPermission(doc, userId);
      library = await getDocByRefAsync(doc.root);
      await assertViewPermission(library, userId)
    }
  } catch (e) {
    cache = { error: errorToString(e) }
    await writeCache(node._id, cache);
    return;
  }
  cache = {
    node: doc,
  };
  if (library) {
    cache.library = {
      id: library._id,
      name: library.name,
    };
  }
  await writeCache(node._id, cache);
}

export default updateReferenceNode;
export { updateReferenceNodeWork }

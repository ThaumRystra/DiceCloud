import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import {
  assertDocEditPermission,
  assertViewPermission,
} from '/imports/api/sharing/sharingPermissions';
import { fetchDocByRefAsync } from '/imports/api/parenting/parentingFunctions';

const updateReferenceNode = new ValidatedMethod({
  name: 'libraryNodes.updateReferenceNode',
  validate: new SimpleSchema({
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
    await assertDocEditPermission(node, userId);
    await updateReferenceNodeWork(node, userId);
  },
});

async function writeCache(_id, cache) {
  await LibraryNodes.updateAsync(_id, { $set: { cache } }, {
    selector: { type: 'reference' },
  });
}

async function updateReferenceNodeWork(node, userId) {
  let cache = {}
  if (!node.ref?.collection || !node.ref?.id) {
    await writeCache(node._id, cache);
    return;
  }
  let doc, library;
  try {
    doc = await fetchDocByRefAsync(node.ref);
    if (doc.removed) throw 'Property has been deleted';
    if (doc.root.id !== node.root.id) {
      library = await fetchDocByRefAsync(doc.root);
      await assertViewPermission(library, userId)
    }
  } catch (e) {
    cache = { error: e.reason || e.message || e.toString() }
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

import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import {
  assertDocEditPermission,
  assertViewPermission,
} from '/imports/api/sharing/sharingPermissions.js';
import fetchDocByRef from '/imports/api/parenting/fetchDocByRef.js';

const updateReferenceNode = new ValidatedMethod({
  name: 'libraryNodes.updateReferenceNode',
  validate: new SimpleSchema({
    _id: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    }
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ _id }) {
    let userId = this.userId;
    let node = LibraryNodes.findOne(_id);
    assertDocEditPermission(node, userId);
    updateReferenceNodeWork(node, userId);
  },
});

function writeCache(_id, cache) {
  LibraryNodes.update(_id, { $set: { cache } }, {
    selector: { type: 'reference' },
  });
}

function updateReferenceNodeWork(node, userId) {
  let cache = {}
  if (!node.ref?.collection || !node.ref?.id) {
    writeCache(node._id, cache);
    return;
  }
  let doc, library;
  try {
    doc = fetchDocByRef(node.ref);
    if (doc.removed) throw 'Property has been deleted';
    if (doc.ancestors[0].id !== node.ancestors[0].id) {
      library = fetchDocByRef(doc.ancestors[0]);
      assertViewPermission(library, userId)
    }
  } catch (e) {
    cache = { error: e.reason || e.message || e.toString() }
    writeCache(node._id, cache);
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
  writeCache(node._id, cache);
}

export default updateReferenceNode;
export { updateReferenceNodeWork }

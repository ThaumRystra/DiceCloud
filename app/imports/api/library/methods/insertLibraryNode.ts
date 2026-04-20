import { ValidatedMethod } from "meteor/mdg:validated-method";
import { TypedSimpleSchema } from "/imports/api/utility/TypedSimpleSchema";
import type { LibraryNode, LibraryNodeTypes } from "/imports/api/library/LibraryNodes";
import { RateLimiterMixin } from "ddp-rate-limiter-mixin";
import { getDocByRefAsync } from "/imports/api/parenting/reference";
import { assertEditPermission } from "/imports/api/sharing/sharingPermissions";
import { updateReferenceNodeWork } from "/imports/api/library/methods/updateReferenceNode";
import { rebuildNestedSets } from "/imports/api/parenting/parentingFunctions";
import LibraryNodes from "/imports/api/library/LibraryNodes";

export const insertLibraryNode = new ValidatedMethod({
  name: 'libraryNodes.insert',
  validate: TypedSimpleSchema.from({
    libraryNode: {
      type: Object,
      blackbox: true,
    },
    parentId: {
      type: String,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ libraryNode }: { libraryNode: Mongo.OptionalId<LibraryNode>, parentId: string }) {

    if (!libraryNode.root) {
      throw new Meteor.Error('no-root', 'Root must be defined');
    }

    const rootDoc = await getDocByRefAsync(libraryNode.root);
    await assertEditPermission(rootDoc, this.userId);

    // Remove its ID if it came with one to force a random one to be generated
    // server-side
    delete libraryNode._id;

    // Insert the node
    const nodeId = await LibraryNodes.insertAsync(libraryNode as LibraryNode);

    // Update the node if it was a reference node
    if (libraryNode.type == 'reference') {
      libraryNode._id = nodeId;
      await updateReferenceNodeWork(libraryNode as LibraryNodeTypes['reference'], this.userId);
    }

    // Tree structure changed by insert, reorder the tree
    await rebuildNestedSets(LibraryNodes, rootDoc!._id);

    // Return the id of the inserted node
    return nodeId;
  },
});

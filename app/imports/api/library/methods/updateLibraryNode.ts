import { RateLimiterMixin } from "ddp-rate-limiter-mixin";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import LibraryNodes, { type LibraryNodeTypes } from "/imports/api/library/LibraryNodes";
import { updateReferenceNodeWork } from "/imports/api/library/methods/updateReferenceNode";
import { assertDocEditPermission } from "/imports/api/sharing/sharingPermissions";

export const updateLibraryNode = new ValidatedMethod<{ _id: string, path: string[], value: unknown }, Promise<number>>({
  name: 'libraryNodes.update',
  validate: ({ _id, path }) => {
    if (!_id) throw new Meteor.Error('id-required', '_id is required');
    // We cannot change these fields with a simple update
    switch (path[0]) {
      case 'type':
      case 'root':
      case 'left':
      case 'right':
      case 'parentId':
        throw new Meteor.Error('invalid-update', 'Can\'t update tree with a simple update, use the dedicated method');
    }
  },
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 15,
    timeInterval: 5000,
  },
  async run({ _id, path, value }) {
    let node = await LibraryNodes.findOneAsync(_id);
    await assertDocEditPermission(node, this.userId);
    const pathString = path.join('.');
    let modifier;
    // unset empty values
    if (value === null || value === undefined) {
      modifier = { $unset: { [pathString]: 1 } };
    } else {
      modifier = { $set: { [pathString]: value } };
    }
    const numUpdated = await LibraryNodes.updateAsync(_id, modifier, {
      selector: { type: node!.type },
    });
    if (node!.type == 'reference') {
      node = await LibraryNodes.findOneAsync(_id);
      if (node) await updateReferenceNodeWork(node as LibraryNodeTypes['reference'], this.userId);
    }
    return numUpdated;
  },
});

import { ValidatedMethod } from 'meteor/mdg:validated-method';
import EngineActions from '/imports/api/engine/action/EngineActions';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import { getCreature } from '/imports/api/engine/loadCreatures';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';

export const updateAction = new ValidatedMethod({
  name: 'actions.updateAction',
  validate({ _id, path, value }) {
    if (!_id) throw new Meteor.Error('No _id', '_id is required');
    // We cannot change these fields with a simple update
    if (path !== 'targetIds') throw new Meteor.Error('Can only update target ids');
    if (!Array.isArray(value)) throw new Meteor.Error('TargetIds must be an array');
  },
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 10,
    timeInterval: 5000,
  },
  run: async function ({ _id, path, value }: { _id: string, path: 'targetIds', value: string[] }) {
    const action = await EngineActions.findOneAsync(_id);
    if (!action) {
      throw new Meteor.Error('not found', 'The given action was not found');
    }
    await assertEditPermission(getCreature(action.creatureId), this.userId);
    return EngineActions.updateAsync(_id, { $set: { [path]: value } });
  },
});

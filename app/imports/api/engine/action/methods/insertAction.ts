import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import EngineActions, { EngineAction, ActionSchema } from '/imports/api/engine/action/EngineActions';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import { getCreature } from '/imports/api/engine/loadCreatures';

export const insertAction = new ValidatedMethod({
  name: 'actions.insertAction',
  validate: new SimpleSchema({
    action: ActionSchema
  }).validator({ clean: true }),
  run: function ({ action }: { action: EngineAction }) {
    assertEditPermission(getCreature(action.creatureId), this.userId);
    // First remove all other actions on this creature
    // only do one action at a time, don't wait for this to finish
    EngineActions.remove({ creatureId: action.creatureId });
    // Force a random id even if one was provided, we may use it later as the seed for PRNG
    delete action._id;
    return EngineActions.insert(action);
  },
});

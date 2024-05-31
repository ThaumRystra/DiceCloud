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
  rateLimit: {
    numRequests: 5,
    timeInterval: 1000,
  },
  run: function ({ action }: { action: EngineAction }) {
    const creature = getCreature(action.creatureId);
    assertEditPermission(getCreature(creature), this.userId);
    // Make sure the action shares the creature's tabletopId
    // It is assumed that if a character you control is in a tabletop, you have the rights
    // to do actions in that tabletop
    action.tabletopId = creature.tabletopId;

    // Ensure that all the targeted creatures exist and share a tabletop
    if (action.targetIds) for (const targetId of action.targetIds) {
      const target = getCreature(targetId);
      if (!target) {
        throw new Meteor.Error('not-found', 'Target creature does not exist');
      }
      if (target.tabletopId !== action.tabletopId) {
        throw new Meteor.Error('permission-denied', 'Target creature does not share a tabletop with the acting creature');
      }
    }

    // First remove all other actions on this creature
    // only do one action at a time, don't wait for this to finish
    EngineActions.remove({ creatureId: action.creatureId });
    // Force a random id even if one was provided, we may use it later as the seed for PRNG
    delete action._id;
    return EngineActions.insert(action);
  },
});

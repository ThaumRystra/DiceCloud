import SimpleSchema from 'simpl-schema';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs';
import { assertViewPermission } from '/imports/api/creature/creatures/creaturePermissions';
import computeCreature from '/imports/api/engine/computeCreature';
import VERSION from '/imports/constants/VERSION';
import { loadCreature } from '/imports/api/engine/loadCreatures';
import { rebuildCreatureNestedSets } from '/imports/api/parenting/parentingFunctions';
import EngineActions from '/imports/api/engine/action/EngineActions';

let schema = new SimpleSchema({
  creatureId: {
    type: String,
    max: 32,
  },
});

Meteor.publish('singleCharacter', async function (creatureId) {
  try {
    schema.validate({ creatureId });
  } catch (e) {
    console.warn(e);
    return this.error(e as Error);
  }
  let userId = this.userId;
  let permissionCreature = await Creatures.findOneAsync({
    _id: creatureId,
  }, {
    fields: {
      owner: 1,
      readers: 1,
      writers: 1,
      public: 1,
      computeVersion: 1,
      tabletopId: 1,
    }
  });
  try {
    assertViewPermission(permissionCreature, userId);
  }
  catch (e) {
    console.warn(e);
    return this.error(e as Error);
  }
  await loadCreature(creatureId, this);
  if (permissionCreature?.computeVersion !== VERSION) {
    try {
      await rebuildCreatureNestedSets(creatureId);
      await computeCreature(creatureId);
    } catch (e) {
      console.error(e);
    }
  }
  return [
    Creatures.find({
      _id: creatureId,
    }),
    CreatureVariables.find({
      _creatureId: creatureId,
    }),
    CreatureProperties.find({
      'root.id': creatureId,
    }),
    CreatureLogs.find({
      creatureId,
    }, {
      limit: 20,
      sort: { date: -1 },
    }),
    EngineActions.find({
      creatureId,
    }),
    // Also publish the owner's username
    Meteor.users.find(permissionCreature?.owner ?? '_', {
      fields: {
        username: 1,
      },
    }),
  ];
});

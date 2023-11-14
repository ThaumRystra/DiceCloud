import SimpleSchema from 'simpl-schema';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs.js';
import { assertViewPermission } from '/imports/api/creature/creatures/creaturePermissions.js';
import computeCreature from '/imports/api/engine/computeCreature.js';
import VERSION from '/imports/constants/VERSION.js';
import { loadCreature } from '/imports/api/engine/loadCreatures.js';

let schema = new SimpleSchema({
  creatureId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
});

Meteor.publish('singleCharacter', function (creatureId) {
  const self = this;
  try {
    schema.validate({ creatureId });
  } catch (e) {
    this.error(e);
  }
  this.autorun(function (computation) {
    let userId = this.userId;
    let permissionCreature = Creatures.findOne({
      _id: creatureId,
    }, {
      fields: { owner: 1, readers: 1, writers: 1, public: 1, computeVersion: 1 }
    });
    try { assertViewPermission(permissionCreature, userId) }
    catch (e) { return [] }
    loadCreature(creatureId, self);
    if (permissionCreature.computeVersion !== VERSION && computation.firstRun) {
      try {
        computeCreature(creatureId)
      }
      catch (e) { console.error(e) }
    }
    return [
      Creatures.find({
        _id: creatureId,
      }),
      CreatureVariables.find({
        _creatureId: creatureId,
      }),
      CreatureProperties.find({
        'ancestors.id': creatureId,
      }),
      CreatureLogs.find({
        creatureId,
      }, {
        limit: 20,
        sort: { date: -1 },
      }),
      // Also publish the owner's username
      Meteor.users.find(permissionCreature.owner, {
        fields: {
          username: 1,
        },
      }),
    ];
  });
});

import Tabletops from '/imports/api/tabletop/Tabletops';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables';
import { loadCreature } from '/imports/api/engine/loadCreatures';
import EngineActions from '/imports/api/engine/action/EngineActions';
import { assertViewPermission } from '/imports/api/creature/creatures/creaturePermissions';

Meteor.publish('tabletops', function () {
  var userId = this.userId;
  if (!userId) {
    return [];
  }
  return Tabletops.find({
    $or: [
      { owner: userId },
      { players: userId },
      { gameMasters: userId },
      { spectators: userId },
    ],
  });
});

Meteor.publish('tabletopUsers', function (tabletopId) {
  if (!tabletopId) return [];
  const tabletop = Tabletops.findOne(tabletopId);
  if (!tabletop) return [];
  const userIds = [
    tabletop.owner,
    ...tabletop.gameMasters,
    ...tabletop.players,
    ...tabletop.spectators,
  ]
  return Meteor.users.find({
    _id: { $in: userIds },
  }, {
    fields: {
      username: 1,
    },
    limit: 500,
  });
});

Meteor.publish('otherTabletopCreatures', function (creatureId) {
  const userId = this.userId;
  if (!userId) return [];
  const permissionCreature = Creatures.findOne({
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
  assertViewPermission(creatureId, this.userId);
  return Creatures.find({
    tabletopId: permissionCreature?.tabletopId,
  }, {
    fields: {
      _id: 1,
      name: 1,
      picture: 1,
      avatarPicture: 1,
      tabletopId: 1,
      initiativeRoll: 1,
      settings: 1,
      propCount: 1,
    },
    limit: 110, // Party vs 100 creatures was a fun encounter to run, so let's support that
  });
});

Meteor.publish('tabletop', function (tabletopId) {
  var userId = this.userId;
  if (!userId) {
    return [];
  }
  this.autorun(function () {
    if (!userId) return [];
    const self = this;
    let tabletopCursor = Tabletops.find({
      _id: tabletopId,
      $or: [
        { owner: userId },
        { players: userId },
        { gameMasters: userId },
        { spectators: userId },
      ]
    });
    let tabletop = tabletopCursor.fetch()[0];
    if (!tabletop) {
      return [];
    }

    // Warning, this leaks data to users of the same tabletop who may not have
    // read permission of this specific creature, so publish as few fields as
    // possible
    let creatureSummariesCursor = Creatures.find({
      tabletopId,
    }, {
      fields: {
        _id: 1,
        name: 1,
        picture: 1,
        avatarPicture: 1,
        tabletopId: 1,
        initiativeRoll: 1,
        settings: 1,
        propCount: 1,
        readers: 1,
        writers: 1,
        owner: 1,
        public: 1,
      },
      limit: 110, // Party vs 100 creatures was a fun encounter to run, so let's support that
    });
    const creatureIds = creatureSummariesCursor.map(c => c._id);

    // Load all the creatures into memory
    creatureIds.forEach(creatureId => {
      loadCreature(creatureId, self);
    });
    const variablesCursor = CreatureVariables.find({
      _creatureId: { $in: creatureIds }
    }, {
      limit: 110,
    });
    const propertiesCursor = CreatureProperties.find({
      'root.id': { $in: creatureIds },
      removed: { $ne: true },
    }, {
      limit: 10_000,
    });
    const logsCursor = CreatureLogs.find({
      tabletopId,
    }, {
      limit: 100,
      sort: { date: -1 },
    });
    const actionsCursor = EngineActions.find({
      tabletopId,
    });

    return [
      tabletopCursor,
      creatureSummariesCursor,
      propertiesCursor,
      logsCursor,
      variablesCursor,
      actionsCursor
    ];
  });
});

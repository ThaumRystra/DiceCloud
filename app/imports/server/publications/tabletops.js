import Tabletops from '/imports/api/tabletop/Tabletops';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables';
import { loadCreature } from '/imports/api/engine/loadCreatures';

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
    let creatureSummaries = Creatures.find({
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
      },
      limit: 110,
    });
    const creatureIds = creatureSummaries.map(c => c._id);
    creatureIds.forEach(creatureId => {
      loadCreature(creatureId, self);
    });
    const variables = CreatureVariables.find({
      _creatureId: { $in: creatureIds }
    }, {
      limit: 110,
    });
    let properties = CreatureProperties.find({
      'ancestors.id': { $in: creatureIds },
      removed: { $ne: true },
    }, {
      limit: 10_000,
    });
    const logs = CreatureLogs.find({
      tabletopId,
    }, {
      limit: 100,
      sort: { date: -1 },
    });
    return [tabletopCursor, creatureSummaries, properties, logs, variables]
  })
});

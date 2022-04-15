import Tabletops from '/imports/api/tabletop/Tabletops.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs.js';

Meteor.publish('tabletops', function(){
  var userId = this.userId;
  if (!userId) {
    return [];
  }
  return Tabletops.find({
    $or: [
      {players: userId},
      {gameMaster: userId},
    ],
  });
});

Meteor.publish('tabletop', function(tabletopId){
  var userId = this.userId;
  if (!userId) {
    return [];
  }
  this.autorun(function (){
    let tabletopCursor = Tabletops.find({
      _id: tabletopId,
      $or: [
        {players: userId},
        {gameMaster: userId},
      ]
    });
    let tabletop = tabletopCursor.fetch()[0];
    if (!tabletop){
      return [];
    }
    // Warning, this leaks data to users of the same tabletop who may not have
    // read permission of this specific creature, so publish as few fields as
    // possible
    let creatureSummaries = Creatures.find({
      tabletop: tabletopId,
    }, {
      fields: {
        name: 1,
        picture: 1,
        avatarPicture: 1,
        variables: 1,
        tabletop: 1,
        initiativeRoll: 1,
      },
    });
    const creatureIds = creatureSummaries.map(c => c._id);
    let properties = CreatureProperties.find({
      'ancestors.0.id': {$in: creatureIds},
      removed: {$ne: true},
    });
    const logs = CreatureLogs.find({
      tabletopId,
    }, {
      limit: 50,
      sort: {date: -1},
    });
    return [ tabletopCursor, creatureSummaries, properties, logs]
  })
});

import Tabletops from '/imports/api/tabletop/Tabletops.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import Messages from '/imports/api/tabletop/Messages.js';

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
    let recentMessages = Messages.find({
      tabletopId,
    }, {
      sort: {
        timeStamp: -1,
      },
      limit: 100,
    });
    return [ tabletopCursor, creatureSummaries, recentMessages]
  })
});

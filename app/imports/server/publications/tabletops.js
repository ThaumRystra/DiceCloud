import Tabletops from '/imports/api/tabletop/Tabletops.js';
import Creatures from '/imports/api/creature/Creatures.js';

Meteor.publish('tabletops', function(){
  var userId = this.userId;
  if (!userId) {
    return this.ready();
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
    return this.ready();
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
      return this.ready();
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
    return [ tabletopCursor, creatureSummaries]
  })
});

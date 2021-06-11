import ArchivedCreatures from '/imports/api/creature/archive/ArchivedCreatures.js';

Meteor.publish('archivedCreatures', function(){
  this.autorun(function (){
    var userId = this.userId;
    if (!userId) {
      return [];
    }
    return ArchivedCreatures.find({
        owner: userId,
      }, {
        fields: {
          creature: 1,
        }
      }
    );
  });
});

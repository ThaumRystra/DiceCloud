import Creatures from '/imports/api/creature/creatures/Creatures';
import Libraries from '/imports/api/library/Libraries';

Meteor.publish('ownedDocuments', function () {
  this.autorun(function () {
    let userId = this.userId;
    if (!userId) {
      return [];
    }
    return [
      Creatures.find({ owner: userId }),
      Libraries.find({ owner: userId }),
    ]
  });
});

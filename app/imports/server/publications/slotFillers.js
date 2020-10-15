import Libraries from '/imports/api/library/Libraries.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';

Meteor.publish('slotFillers', function(slotId){
  this.autorun(function (){
    let userId = this.userId;
    if (!userId) {
      return [];
    }
    // Get the slot
    let slot = CreatureProperties.findOne(slotId);
    if (!slot){
      return [];
    }

    // Get all the ids of libraries the user can access
    const user = Meteor.users.findOne(userId, {
      fields: {subscribedLibraries: 1}
    });
    const subs = user && user.subscribedLibraries || [];
    let libraryIds = Libraries.find({
      $or: [
        {owner: this.userId},
        {writers: this.userId},
        {readers: this.userId},
        {_id: {$in: subs}},
      ]
    }, {
      fields: {_id: 1},
    }).map(lib => lib._id);

    // Build a filter for nodes in those libraries that match the slot
    let filter = {
      'ancestors.id': {$in: libraryIds},
    };
    if (slot.tags.length){
      filter.tags = {$all: slot.slotTags};
    }
    if (slot.slotType){
      filter.$or = [{
          type: slot.slotType
        },{
          type: 'slotFiller',
          slotFillerType: slot.slotType,
      }];
    }
    return LibraryNodes.find(filter);
  });
});

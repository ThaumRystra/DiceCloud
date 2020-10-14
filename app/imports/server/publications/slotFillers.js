import Libraries from '/imports/api/library/Libraries.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';

Meteor.publish('slotFillers', function(slotId){
  this.autorun(function (){
    if (!this.userId) {
      return this.ready();
    }
    // Get the slot
    let slot = CreatureProperties.findOne(slotId);
    if (!slot){
      return this.ready()
    }

    // Get all the ids of libraries the user can access
    const user = Meteor.users.findOne(this.userId, {
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
      'tags': {$all: slot.slotTags},
    };
    if (slot.slotType){
      filter.type = slot.slotType;
    }
    return LibraryNodes.find(filter);
  });
});

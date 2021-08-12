import { check } from 'meteor/check';
import Libraries from '/imports/api/library/Libraries.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import getSlotFillFilter from '/imports/api/creature/creatureProperties/methods/getSlotFillFilter.js'

Meteor.publish('slotFillers', function(slotId, searchTerm){
  if (searchTerm) check(searchTerm, String);

  let self = this;
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
    let libraries = Libraries.find({
      $or: [
        {owner: this.userId},
        {writers: this.userId},
        {readers: this.userId},
        {_id: {$in: subs}},
      ]
    }, {
      fields: {_id: 1, name: 1},
    });
    let libraryIds = libraries.map(lib => lib._id);

    // Build a filter for nodes in those libraries that match the slot
    let filter = getSlotFillFilter({slot, libraryIds});

    this.autorun(function(){
      // Get the limit of the documents the user can fetch
      var limit = self.data('limit') || 50;
      check(limit, Number);

      let options = undefined;
      if (searchTerm){
        filter.$text = {$search: searchTerm};
        options = {
          // relevant documents have a higher score.
          fields: {
            _score: { $meta: 'textScore' }
          },
          sort: {
            // `score` property specified in the projection fields above.
            _score: { $meta: 'textScore' },
            name: 1,
            order: 1,
          }
        }
      } else {
        delete filter.$text
        options = {sort: {
          name: 1,
          order: 1,
        }};
      }
      options.limit = limit;

      self.autorun(function () {
        self.setData('countAll', LibraryNodes.find(filter).count());
      });
      self.autorun(function () {
        Meteor._sleepForMs(1000);
        return [LibraryNodes.find(filter, options), libraries];
      });
    });
  });
});

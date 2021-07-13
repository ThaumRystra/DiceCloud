import SimpleSchema from 'simpl-schema';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import Experiences from '/imports/api/creature/experience/Experiences.js';
import { assertViewPermission } from '/imports/api/creature/creatures/creaturePermissions.js';

let schema = new SimpleSchema({
  creatureId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
});

Meteor.publish('experiences', function(creatureId){
  schema.validate({ creatureId });
  this.autorun(function (){
    let userId = this.userId;
    if (!userId) {
      return [];
    }
    let creatureCursor = Creatures.find({
      _id: creatureId,
      $or: [
        {readers: userId},
        {writers: userId},
        {owner: userId},
        {public: true},
      ],
    });
    try {
      assertViewPermission(creatureCursor.fetch()[0], this.userId);
    } catch (e){
      return [];
    }
    return [
      Experiences.find({
        creatureId,
      }),
    ];
  });
});

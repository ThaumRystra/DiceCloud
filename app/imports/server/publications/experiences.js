import SimpleSchema from 'simpl-schema';
import Creatures from '/imports/api/creature/Creatures.js';
import Experiences from '/imports/api/creature/experience/Experiences.js';

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
    let creatureCursor = Creatures.find({
      _id: creatureId,
      $or: [
        {readers: userId},
        {writers: userId},
        {owner: userId},
        {public: true},
      ],
    });
    if (!creatureCursor.count()) return this.ready();
    return [
      Experiences.find({
        creatureId,
      }),
    ];
  });
});

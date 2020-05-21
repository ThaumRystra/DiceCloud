import SimpleSchema from 'simpl-schema';
import Creatures from '/imports/api/creature/Creatures.js';
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';

let schema = new SimpleSchema({
  creatureId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
});

Meteor.publish('singleCharacter', function(creatureId){
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
      creatureCursor,
      CreatureProperties.find({
        'ancestors.id': creatureId,
      }),
    ];
  });
});

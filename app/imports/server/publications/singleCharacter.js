import SimpleSchema from 'simpl-schema';
import Creatures from '/imports/api/creature/Creatures.js';
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs.js';
import { assertViewPermission } from '/imports/api/creature/creaturePermissions.js';
import { recomputeCreatureById } from '/imports/api/creature/computation/recomputeCreature.js';
import VERSION from '/imports/constants/VERSION.js';

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
      let creature = creatureCursor.fetch()[0];
      assertViewPermission(creature, userId);
      if (creature.computeVersion !== VERSION){
        recomputeCreatureById(creatureId)
      }
    } catch (e){
      console.error(e);
      return [];
    }
    return [
      creatureCursor,
      CreatureProperties.find({
        'ancestors.id': creatureId,
      }),
      CreatureLogs.find({
        creatureId,
      }, {
        limit: 20,
        sort: {date: -1},
      }),
    ];
  });
});

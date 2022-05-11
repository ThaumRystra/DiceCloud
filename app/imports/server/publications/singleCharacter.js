import SimpleSchema from 'simpl-schema';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs.js';
import { assertViewPermission } from '/imports/api/creature/creatures/creaturePermissions.js';
import computeCreature from '/imports/api/engine/computeCreature.js';
import VERSION from '/imports/constants/VERSION.js';

let schema = new SimpleSchema({
  creatureId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
});

Meteor.publish('singleCharacter', function(creatureId){
  try {
    schema.validate({ creatureId });
  } catch (e){
    this.error(e);
  }
  this.autorun(function (computation){
    const userId = this.userId;
    const creature = Creatures.findOne({
      _id: creatureId,
    }, {
      fields: {
        owner: 1,
        readers: 1,
        writers: 1,
        public: 1,
        computeVersion: 1,
      }
    });
    try { assertViewPermission(creature, userId) }
    catch(e){ return [] }
    if (creature.computeVersion !== VERSION && computation.firstRun){
      try {
        computeCreature(creatureId)
      }
      catch(e){ console.error(e) }
    }
    return [
      Creatures.find({
        _id: creatureId,
      }),
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

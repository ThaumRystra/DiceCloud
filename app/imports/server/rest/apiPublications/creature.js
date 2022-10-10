import SimpleSchema from 'simpl-schema';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables';
import { assertViewPermission } from '/imports/api/creature/creatures/creaturePermissions.js';
import computeCreature from '/imports/api/engine/computeCreature.js';
import VERSION from '/imports/constants/VERSION.js';

Meteor.publish('api-creature', function(creatureId){
  try {
    new SimpleSchema({
      creatureId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
      },
    }).validate({ creatureId });
  } catch (e){
    this.error(e);
    return;
  }
  const userId = this.userId;
  const creatureCursor = Creatures.find({
    _id: creatureId,
  });
  const creature = creatureCursor.fetch()[0];
  try {
    assertViewPermission(creature, userId)
  } catch(e){
    this.error(e);
    return;
  }
  if (creature.computeVersion !== VERSION){
    try {
      computeCreature(creatureId)
    } catch(e){
      console.error(e)
    }
  }
  return [
    creatureCursor,
    CreatureProperties.find({
      'ancestors.id': creatureId,
    }),
    CreatureVariables.find({
      _creatureId: creatureId,
    }),
  ];
}, {
  url: 'api/creature/:0'
});

import SimpleSchema from 'simpl-schema';
import Creatures from '/imports/api/creature/creatures/Creatures';
import Experiences from '/imports/api/creature/experience/Experiences';
import { assertViewPermission } from '/imports/api/creature/creatures/creaturePermissions';

let schema = new SimpleSchema({
  creatureId: {
    type: String,
    max: 32,
  },
});

Meteor.publish('experiences', function (creatureId) {
  schema.validate({ creatureId });
  let userId = this.userId;
  if (!userId) {
    return [];
  }
  let creature = Creatures.findOne(creatureId);
  try {
    assertViewPermission(creature, userId);
  } catch (e) {
    return [];
  }
  return [
    Experiences.find({
      creatureId,
    }),
  ];
});

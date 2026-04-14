import SimpleSchema from 'simpl-schema';
import Creatures from '/imports/api/creature/creatures/Creatures';
import Experiences from '/imports/api/creature/experience/Experiences';
import { assertViewPermission } from '/imports/api/creature/creatures/creaturePermissions';

const schema = new SimpleSchema({
  creatureId: {
    type: String,
    max: 32,
  },
});

Meteor.publish('experiences', async function (creatureId) {
  schema.validate({ creatureId });
  const userId = this.userId;
  if (!userId) {
    return this.error(new Meteor.Error('logged-out', 'You must be logged in to get a creature\'s experiences'));
  }
  const creature = await Creatures.findOneAsync(creatureId);
  try {
    await assertViewPermission(creature, userId);
  } catch (e) {
    console.warn(e);
    return this.error(e as Error);
  }
  return [
    Experiences.find({
      creatureId,
    }),
  ];
});

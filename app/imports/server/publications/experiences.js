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
  this.autorun(function () {
    let userId = this.userId;
    if (!userId) {
      return [];
    }
    let creatureCursor = Creatures.find({
      _id: creatureId,
      $or: [
        { readers: userId },
        { writers: userId },
        { owner: userId },
        { public: true },
      ],
    });
    try {
      assertViewPermission(creatureCursor.fetch()[0], this.userId);
    } catch (e) {
      return [];
    }
    return [
      Experiences.find({
        creatureId,
      }),
    ];
  });
});

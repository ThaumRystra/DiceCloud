import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions';
import Creatures from '/imports/api/creature/creatures/Creatures';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';

const Experiences = new Mongo.Collection('experiences');

const ExperienceSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  // The amount of XP this experience gives
  xp: {
    type: SimpleSchema.Integer,
    optional: true,
    min: 0,
  },
  // Setting levels instead of value grants whole levels
  levels: {
    type: SimpleSchema.Integer,
    optional: true,
    min: 0,
  },
  // The real-world date that it occurred, usually sorted by date
  date: {
    type: Date,
    autoValue: function () {
      // If the date isn't set, set it to now
      if (!this.isSet) {
        return new Date();
      }
    },
  },
  creatureId: {
    type: String,
    max: 32,
  },
});

Experiences.attachSchema(ExperienceSchema);

const insertExperienceForCreature = async function ({ experience, creatureId }) {
  if (experience.xp) {
    await Creatures.updateAsync(creatureId, {
      $inc: { 'denormalizedStats.xp': experience.xp },
      $set: { dirty: true },
    });
  }
  if (experience.levels) {
    await Creatures.updateAsync(creatureId, {
      $inc: { 'denormalizedStats.milestoneLevels': experience.levels },
      $set: { dirty: true },
    });
  }
  experience.creatureId = creatureId;
  const id = await Experiences.insertAsync(experience);
  return id;
};

const insertExperience = new ValidatedMethod({
  name: 'experiences.insert',
  validate: new SimpleSchema({
    experience: {
      type: ExperienceSchema.omit('creatureId'),
    },
    creatureIds: {
      type: Array,
      max: 12,
    },
    'creatureIds.$': {
      type: String,
      max: 32,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ experience, creatureIds }) {
    const userId = this.userId;
    if (!userId) {
      throw new Meteor.Error('Experiences.methods.insert.denied',
        'You need to be logged in to insert an experience');
    }
    const insertedIds = [];
    for (const creatureId of creatureIds) {
      await assertEditPermission(creatureId, userId);
      const id = await insertExperienceForCreature({ experience, creatureId });
      insertedIds.push(id);
    }
    return insertedIds;
  },
});

const removeExperience = new ValidatedMethod({
  name: 'experiences.remove',
  validate: new SimpleSchema({
    experienceId: {
      type: String,
      max: 32,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ experienceId }) {
    const userId = this.userId;
    if (!userId) {
      throw new Meteor.Error('Experiences.methods.remove.denied',
        'You need to be logged in to remove an experience');
    }
    const experience = await Experiences.findOneAsync(experienceId);
    if (!experience) return;
    const creatureId = experience.creatureId
    await assertEditPermission(creatureId, userId);
    if (experience.xp) {
      await Creatures.updateAsync(creatureId, {
        $inc: { 'denormalizedStats.xp': -experience.xp },
        $set: { dirty: true },
      });
    }
    if (experience.levels) {
      await Creatures.updateAsync(creatureId, {
        $inc: { 'denormalizedStats.milestoneLevels': -experience.levels },
        $set: { dirty: true },
      });
    }
    experience.creatureId = creatureId;
    const numRemoved = await Experiences.removeAsync(experienceId);
    return numRemoved;
  },
});

const recomputeExperiences = new ValidatedMethod({
  name: 'experiences.recompute',
  validate: new SimpleSchema({
    creatureId: {
      type: String,
      max: 32,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ creatureId }) {
    const userId = this.userId;
    if (!userId) {
      throw new Meteor.Error('Experiences.methods.recompute.denied',
        'You need to be logged in to recompute a creature\'s experiences');
    }
    await assertEditPermission(creatureId, userId);

    let xp = 0;
    let milestoneLevels = 0;
    await Experiences.find({
      creatureId
    }, {
      fields: { xp: 1, levels: 1 }
    }).forEachAsync(experience => {
      xp += experience.xp || 0;
      milestoneLevels += experience.levels || 0;
    });
    await Creatures.updateAsync(creatureId, {
      $set: {
        'denormalizedStats.xp': xp,
        'denormalizedStats.milestoneLevels': milestoneLevels,
        dirty: true,
      }
    });
  },
});

export default Experiences;
export { ExperienceSchema, insertExperience, insertExperienceForCreature, removeExperience, recomputeExperiences };

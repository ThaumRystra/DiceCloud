import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions';
import Creatures from '/imports/api/creature/creatures/Creatures';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';

let Experiences = new Mongo.Collection('experiences');

let ExperienceSchema = new SimpleSchema({
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
    index: 1,
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
    index: 1,
  },
  creatureId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1,
  },
});

Experiences.attachSchema(ExperienceSchema);

const insertExperienceForCreature = function ({ experience, creatureId }) {
  if (experience.xp) {
    Creatures.update(creatureId, {
      $inc: { 'denormalizedStats.xp': experience.xp },
      $set: { dirty: true },
    });
  }
  if (experience.levels) {
    Creatures.update(creatureId, {
      $inc: { 'denormalizedStats.milestoneLevels': experience.levels },
      $set: { dirty: true },
    });
  }
  experience.creatureId = creatureId;
  let id = Experiences.insert(experience);
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
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ experience, creatureIds }) {
    let userId = this.userId;
    if (!userId) {
      throw new Meteor.Error('Experiences.methods.insert.denied',
        'You need to be logged in to insert an experience');
    }
    let insertedIds = [];
    creatureIds.forEach(creatureId => {
      assertEditPermission(creatureId, userId);
      let id = insertExperienceForCreature({ experience, creatureId });
      insertedIds.push(id);
    });
    return insertedIds;
  },
});

const removeExperience = new ValidatedMethod({
  name: 'experiences.remove',
  validate: new SimpleSchema({
    experienceId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ experienceId }) {
    let userId = this.userId;
    if (!userId) {
      throw new Meteor.Error('Experiences.methods.remove.denied',
        'You need to be logged in to remove an experience');
    }
    let experience = Experiences.findOne(experienceId);
    if (!experience) return;
    let creatureId = experience.creatureId
    assertEditPermission(creatureId, userId);
    if (experience.xp) {
      Creatures.update(creatureId, {
        $inc: { 'denormalizedStats.xp': -experience.xp },
        $set: { dirty: true },
      });
    }
    if (experience.levels) {
      Creatures.update(creatureId, {
        $inc: { 'denormalizedStats.milestoneLevels': -experience.levels },
        $set: { dirty: true },
      });
    }
    experience.creatureId = creatureId;
    let numRemoved = Experiences.remove(experienceId);
    return numRemoved;
  },
});

const recomputeExperiences = new ValidatedMethod({
  name: 'experiences.recompute',
  validate: new SimpleSchema({
    creatureId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ creatureId }) {
    let userId = this.userId;
    if (!userId) {
      throw new Meteor.Error('Experiences.methods.recompute.denied',
        'You need to be logged in to recompute a creature\'s experiences');
    }
    assertEditPermission(creatureId, userId);

    let xp = 0;
    let milestoneLevels = 0;
    Experiences.find({
      creatureId
    }, {
      fields: { xp: 1, levels: 1 }
    }).forEach(experience => {
      xp += experience.xp || 0;
      milestoneLevels += experience.levels || 0;
    });
    Creatures.update(creatureId, {
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

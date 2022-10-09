import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import simpleSchemaMixin from '/imports/api/creature/mixins/simpleSchemaMixin.js';
import Creatures, { CreatureSchema } from '/imports/api/creature/creatures/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import defaultCharacterProperties from '/imports/api/creature/creatures/defaultCharacterProperties.js';
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode.js';
import assertHasCharactersSlots from '/imports/api/creature/creatures/methods/assertHasCharacterSlots.js';
import getSlotFillFilter from '/imports/api/creature/creatureProperties/methods/getSlotFillFilter.js';
import getCreatureLibraryIds from '/imports/api/library/getCreatureLibraryIds.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import { insertExperienceForCreature } from '/imports/api/creature/experience/Experiences.js';
import SimpleSchema from 'simpl-schema';

const insertCreature = new ValidatedMethod({
  name: 'creatures.insertCreature',
  mixins: [RateLimiterMixin, simpleSchemaMixin],
  schema: CreatureSchema.pick(
    'name',
    'gender',
    'alignment',
    'allowedLibraries',
    'allowedLibraryCollections',
  ).extend({
    'startingLevel': {
      type: SimpleSchema.Integer,
      min: 0,
    },
  }),
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },

  run({ name, gender, alignment, startingLevel,
    allowedLibraries, allowedLibraryCollections }) {
    const userId = this.userId
    if (!userId) {
      throw new Meteor.Error('Creatures.methods.insert.denied',
        'You need to be logged in to insert a creature');
    }

    assertHasCharactersSlots(userId);

    // Create the creature document
    let creatureId = Creatures.insert({
      owner: userId,
      name,
      gender,
      alignment,
      allowedLibraries,
      allowedLibraryCollections,
    });

    // Insert experience to get character to starting level
    if (startingLevel) {
      insertExperienceForCreature({
        experience: {
          name: 'Starting level',
          levels: startingLevel,
          creatureId
        },
        creatureId,
        userId,
      });
    }

    // Insert the default properties
    // Not batchInsert because we want the properties cleaned by the schema
    let baseId, rulesetSlot;
    defaultCharacterProperties(creatureId).forEach(prop => {
      let id = CreatureProperties.insert(prop);
      if (prop.name === 'Ruleset') {
        baseId = id;
        rulesetSlot = prop;
      }
    });

    // If the user only has a single ruleset subscribed, use it by default
    if (Meteor.isServer) {
      insertDefaultRuleset(creatureId, baseId, userId, rulesetSlot);
    }

    return creatureId;
  },
});

// If the user only has a single ruleset subscribed, insert it by default
function insertDefaultRuleset(creatureId, baseId, userId, slot) {
  const libraryIds = getCreatureLibraryIds(creatureId, userId);
  const filter = getSlotFillFilter({ slot, libraryIds });
  const fillCursor = LibraryNodes.find(filter, { fields: { _id: 1 } });
  const numRulesets = fillCursor.count();
  if (numRulesets === 1) {
    const ruleset = fillCursor.fetch()[0]
    insertPropertyFromLibraryNode.call({
      nodeIds: [ruleset._id],
      parentRef: { id: baseId, collection: 'creatureProperties' },
      order: 0.5,
    });
  }
}

export default insertCreature;

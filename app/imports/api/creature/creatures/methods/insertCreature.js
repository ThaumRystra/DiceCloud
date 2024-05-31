import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import simpleSchemaMixin from '/imports/api/creature/mixins/simpleSchemaMixin';
import Creatures, { CreatureSchema } from '/imports/api/creature/creatures/Creatures';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import defaultCharacterProperties from '/imports/api/creature/creatures/defaultCharacterProperties';
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode';
import assertHasCharactersSlots from '/imports/api/creature/creatures/methods/assertHasCharacterSlots';
import getSlotFillFilter from '/imports/api/creature/creatureProperties/methods/getSlotFillFilter';
import getCreatureLibraryIds from '/imports/api/library/getCreatureLibraryIds';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import { insertExperienceForCreature } from '/imports/api/creature/experience/Experiences';
import SimpleSchema from 'simpl-schema';

const insertCreature = new ValidatedMethod({
  name: 'creatures.insertCreature',
  mixins: [RateLimiterMixin, simpleSchemaMixin],
  validate: CreatureSchema.pick(
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
  }).validator(),
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
      type: 'pc',
      allowedLibraries,
      allowedLibraryCollections,
      settings: {},
      readers: [],
      writers: [],
      public: false,
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
    });
  }
}

export default insertCreature;

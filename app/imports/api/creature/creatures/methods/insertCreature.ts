import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Creatures, { CreatureSchema } from '/imports/api/creature/creatures/Creatures';
import CreatureProperties, { type CreaturePropertyTypes } from '/imports/api/creature/creatureProperties/CreatureProperties';
import defaultCharacterProperties from '/imports/api/creature/creatures/defaultCharacterProperties';
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode';
import assertHasCharactersSlots from '/imports/api/creature/creatures/methods/assertHasCharacterSlots';
import getSlotFillFilter from '/imports/api/creature/creatureProperties/methods/getSlotFillFilter';
import getCreatureLibraryIds from '/imports/api/library/getCreatureLibraryIds';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import { insertExperienceWork } from '/imports/api/creature/experience/Experiences';
import SimpleSchema from 'simpl-schema';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

const insertCreature = new ValidatedMethod({
  name: 'creatures.insertCreature',
  mixins: [RateLimiterMixin],
  validate: CreatureSchema.pick(
    'name' as const,
    'gender' as const,
    'alignment' as const,
    'allowedLibraries' as const,
    'allowedLibraryCollections' as const,
  ).extend(TypedSimpleSchema.from({
    'startingLevel': {
      type: SimpleSchema.Integer,
      min: 0,
    },
  })).validator(),
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ name, gender, alignment, startingLevel,
    allowedLibraries, allowedLibraryCollections }) {
    const userId = this.userId
    if (!userId) {
      throw new Meteor.Error('Creatures.methods.insert.denied',
        'You need to be logged in to insert a creature');
    }

    await assertHasCharactersSlots(userId);

    // Create the creature document
    const creatureId = await Creatures.insertAsync({
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
      propCount: 0,
      denormalizedStats: { xp: 0, milestoneLevels: 0 },
    });

    // Insert experience to get character to starting level
    if (startingLevel) {
      await insertExperienceWork({
        date: new Date(),
        name: 'Starting level',
        levels: startingLevel,
        creatureId,
      });
    }

    // Insert the default properties
    // Not batchInsert because we want the properties cleaned by the schema
    let baseId: string | undefined;
    let rulesetSlot: CreaturePropertyTypes['propertySlot'] | undefined = undefined;
    for (const prop of defaultCharacterProperties(creatureId)) {
      const id = await CreatureProperties.insertAsync(prop);
      if (prop.type === 'propertySlot' && prop.name === 'Ruleset') {
        baseId = id;
        rulesetSlot = {
          _id: id,
          ...prop,
        };
      }
    }

    // If the user only has a single ruleset subscribed, use it by default
    if (Meteor.isServer && rulesetSlot && baseId) {
      await insertDefaultRuleset({ creatureId, baseId, userId, slot: rulesetSlot });
    }

    return creatureId;
  },
});

// If the user only has a single ruleset subscribed, insert it by default
async function insertDefaultRuleset({ creatureId, baseId, userId, slot }: {
  creatureId: string,
  baseId: string,
  userId: string,
  slot: CreaturePropertyTypes['propertySlot'],
}) {
  const libraryIds = await getCreatureLibraryIds(creatureId, userId);
  const filter = getSlotFillFilter({ slot, libraryIds });
  const numRulesets = await LibraryNodes.find(filter, { fields: { _id: 1 } }).countAsync();
  if (numRulesets === 1) {
    const ruleset = await LibraryNodes.findOneAsync(filter, { fields: { _id: 1 } });
    if (!ruleset) return;
    await insertPropertyFromLibraryNode.callAsync({
      nodeIds: [ruleset._id],
      root: {
        collection: 'creatures',
        id: creatureId,
      },
      parentId: baseId,
    });
  }
}

export default insertCreature;

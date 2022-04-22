import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import defaultCharacterProperties from '/imports/api/creature/creatures/defaultCharacterProperties.js';
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode.js';
import assertHasCharactersSlots from '/imports/api/creature/creatures/methods/assertHasCharacterSlots.js';

const insertCreature = new ValidatedMethod({

  name: 'creatures.insertCreature',

  validate: null,

  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },

  run() {
    if (!this.userId) {
      throw new Meteor.Error('Creatures.methods.insert.denied',
      'You need to be logged in to insert a creature');
    }

    assertHasCharactersSlots(this.userId);

		// Create the creature document
    let creatureId = Creatures.insert({
			owner: this.userId,
		});

    // Insert the default properties
    // Not batchInsert because we want the properties cleaned by the schema
    let baseId;
    defaultCharacterProperties(creatureId).forEach(prop => {
      let id = CreatureProperties.insert(prop);
      if (prop.name === 'Ruleset'){
        baseId = id;
      }
    });

    if (Meteor.isServer){
      // Insert the 5e ruleset as the default base
      insertPropertyFromLibraryNode.call({
        nodeIds: ['iHbhfcg3AL5isSWbw'],
        parentRef: {id: baseId, collection: 'creatureProperties'},
        order: 0.5,
      });
    }

		return creatureId;
  },
});

export default insertCreature;

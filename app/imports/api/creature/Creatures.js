import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import deathSaveSchema from '/imports/api/properties/subSchemas/DeathSavesSchema.js'
import ColorSchema from '/imports/api/properties/subSchemas/ColorSchema.js';
import SharingSchema from '/imports/api/sharing/SharingSchema.js';
import {assertEditPermission} from '/imports/api/sharing/sharingPermissions.js';
import { getUserTier } from '/imports/api/users/patreon/tiers.js';

import '/imports/api/creature/removeCreature.js';
import '/imports/api/creature/restCreature.js';

//set up the collection for creatures
let Creatures = new Mongo.Collection('creatures');

let CreatureSettingsSchema = new SimpleSchema({
	//slowed down by carrying too much?
	useVariantEncumbrance: {
		type: Boolean,
		optional: true,
	},
	//hide spellcasting tab
	hideSpellcasting: {
		type: Boolean,
		optional: true,
	},
	// Swap around the modifier and stat
	swapStatAndModifier: {
		type: Boolean,
		optional: true,
	},
  // Hide all the unused stats
  hideUnusedStats: {
    type: Boolean,
    optional: true,
  },
  // How much each hitDice resets on a long rest
  hitDiceResetMultiplier: {
    type: Number,
    optional: true,
    min: 0,
    max: 1,
  }
});

let CreatureSchema = new SimpleSchema({
	// Strings
	name: {
		type: String,
		defaultValue: '',
		optional: true,
	},
	alignment: {
		type: String,
		optional: true
	},
	gender: {
		type: String,
		optional: true
	},
	picture: {
		type: String,
		optional: true
	},
  avatarPicture: {
    type: String,
    optional: true,
  },
	// Mechanics
	deathSave: {
		type: deathSaveSchema,
		defaultValue: {},
	},
  // Stats that are computed and denormalised outside of recomputation
  denormalizedStats: {
    type: Object,
    defaultValue: {},
  },
  // Sum of all XP gained by this character
	'denormalizedStats.xp': {
		type: SimpleSchema.Integer,
		defaultValue: 0,
	},
  // Sum of all levels granted by milestone XP
  'denormalizedStats.milestoneLevels': {
    type: SimpleSchema.Integer,
    defaultValue: 0,
  },
  // Sum of all weights of items and containers that are carried
	'denormalizedStats.weightCarried': {
		type: Number,
		defaultValue: 0,
	},
	type: {
		type: String,
		defaultValue: 'pc',
		allowedValues: ['pc', 'npc', 'monster'],
	},
  damageMultipliers: {
    type: Object,
		blackbox: true,
		defaultValue: {}
  },
	variables: {
		type: Object,
		blackbox: true,
		defaultValue: {}
	},

	// Settings
	settings: {
		type: CreatureSettingsSchema,
		defaultValue: {},
	},
});

CreatureSchema.extend(ColorSchema);
CreatureSchema.extend(SharingSchema);

Creatures.attachSchema(CreatureSchema);

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
    let tier = getUserTier(this.userId);
    if (!tier.paidBenefits){
      throw new Meteor.Error('Creatures.methods.insert.denied',
      `The ${tier.name} tier does not allow you to insert a creature`);
    }

		// Create the creature document
    let charId = Creatures.insert({
			owner: this.userId,
		});
		this.unblock();
		return charId;
  },

});

const updateCreature = new ValidatedMethod({
  name: 'creatures.update',
  validate({_id, path}){
		if (!_id) return false;
		// Allowed fields
		let allowedFields = [
      'name',
      'alignment',
      'gender',
      'picture',
      'avatarPicture',
      'color',
      'settings',
    ];
		if (!allowedFields.includes(path[0])){
			throw new Meteor.Error('Creatures.methods.update.denied',
      'This field can\'t be updated using this method');
		}
  },
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({_id, path, value}) {
		let creature = Creatures.findOne(_id);
    assertEditPermission(creature, this.userId);
    if (value === undefined || value === null){
      Creatures.update(_id, {
        $unset: {[path.join('.')]: 1},
      });
    } else {
      Creatures.update(_id, {
        $set: {[path.join('.')]: value},
      });
    }
  },
});

export default Creatures;
export { CreatureSchema, insertCreature, updateCreature };

import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import deathSaveSchema from '/imports/api/properties/subSchemas/DeathSavesSchema.js'
import ColorSchema from '/imports/api/properties/subSchemas/ColorSchema.js';
import SharingSchema from '/imports/api/sharing/SharingSchema.js';
import {assertEditPermission} from '/imports/api/sharing/sharingPermissions.js';

import '/imports/api/creature/removeCreature.js';

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
	xp: {
		type: SimpleSchema.Integer,
		defaultValue: 0,
	},
	weightCarried: {
		type: Number,
		defaultValue: 0,
	},
	level: {
		type: SimpleSchema.Integer,
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

  name: 'Creatures.methods.insertCreature',

  validate: null,

  run() {
    if (!this.userId) {
      throw new Meteor.Error('Creatures.methods.insert.denied',
      'You need to be logged in to insert a creature');
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
  name: 'Creatures.methods.update',
  validate({_id, path}){
		if (!_id) return false;
		// Allowed fields
		let allowedFields = ['name', 'alignment', 'gender', 'picture', 'avatarPicture', 'settings'];
		if (!allowedFields.includes(path[0])){
			throw new Meteor.Error('Creatures.methods.update.denied',
      'This field can\'t be updated using this method');
		}
  },
  run({_id, path, value}) {
		let creature = Creatures.findOne(_id);
    assertEditPermission(creature, this.userId);
		Creatures.update(_id, {
			$set: {[path.join('.')]: value},
		});
  },
});

export default Creatures;
export { CreatureSchema, insertCreature, updateCreature };

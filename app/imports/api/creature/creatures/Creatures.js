import SimpleSchema from 'simpl-schema';
import deathSaveSchema from '/imports/api/properties/subSchemas/DeathSavesSchema.js'
import ColorSchema from '/imports/api/properties/subSchemas/ColorSchema.js';
import SharingSchema from '/imports/api/sharing/SharingSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

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
  //hide rest buttons
  hideRestButtons: {
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
  // Show the tree tab
  showTreeTab: {
    type: Boolean,
    optional: true,
  },
  // Hide the spells tab
  hideSpellsTab: {
    type: Boolean,
    optional: true,
  },
  // Hide calculation errors
  hideCalculationErrors: {
    type: Boolean,
    optional: true,
  },
  // How much each hitDice resets on a long rest
  hitDiceResetMultiplier: {
    type: Number,
    optional: true,
    min: 0,
    max: 1,
  },
  discordWebhook: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.url,
  },
});

let CreatureSchema = new SimpleSchema({
  // Strings
  name: {
    type: String,
    defaultValue: '',
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  alignment: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  gender: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  picture: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.url,
  },
  avatarPicture: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.url,
  },

  // Libraries
  allowedLibraries: {
    type: Array,
    optional: true,
    maxCount: 100,
  },
  'allowedLibraries.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  allowedLibraryCollections: {
    type: Array,
    optional: true,
    maxCount: 100,
  },
  'allowedLibraryCollections.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
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
  // Does the character need a recompute?
  dirty: {
    type: Boolean,
    optional: true,
  },
  // Version of computation engine that was last used to compute this creature
  computeVersion: {
    type: String,
    optional: true,
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
  computeErrors: {
    type: Array,
    optional: true,
  },
  'computeErrors.$': {
    type: Object,
  },
  'computeErrors.$.type': {
    type: String,
  },
  'computeErrors.$.details': {
    type: Object,
    blackbox: true,
    optional: true,
  },

  // Tabletop
  tabletop: {
    type: String,
    regEx: SimpleSchema.RegEx.id,
    optional: true,
  },
  initiativeRoll: {
    type: SimpleSchema.Integer,
    optional: true,
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



export default Creatures;
export { CreatureSchema };

import '/imports/api/engine/actions/doAction.js';

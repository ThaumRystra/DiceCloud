import SimpleSchema from 'simpl-schema';
import ColorSchema from '/imports/api/properties/subSchemas/ColorSchema';
import SharingSchema from '/imports/api/sharing/SharingSchema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { InferType, TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';
import type { Simplify } from 'type-fest';

const CreatureSettingsSchema = TypedSimpleSchema.from({
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

const CreatureSchema = TypedSimpleSchema.from({
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
    max: 32,
  },
  allowedLibraryCollections: {
    type: Array,
    optional: true,
    maxCount: 100,
  },
  'allowedLibraryCollections.$': {
    type: String,
    max: 32,
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
  propCount: {
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
  lastComputedAt: {
    type: Date,
    optional: true,
  },

  // Tabletop
  tabletopId: {
    index: 1,
    type: String,
    max: 32,
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
})
  .extend(ColorSchema)
  .extend(SharingSchema);

export type Creature = Simplify<{ _id: string } & InferType<typeof CreatureSchema>>;

//set up the collection for creatures
const Creatures = new Mongo.Collection<Creature>('creatures');
Creatures.attachSchema(CreatureSchema);

export default Creatures;
export { CreatureSchema };

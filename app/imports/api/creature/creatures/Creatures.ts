import colorSchema from '/imports/api/properties/subSchemas/color.schema';
import SharingSchema from '/imports/api/sharing/sharing.schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import type { Simplify } from 'type-fest';
import { z } from 'zod';

const creatureSchema = z.object({
  // Strings
  name: z.string().max(STORAGE_LIMITS.name).default(''),
  alignment: z.string().max(STORAGE_LIMITS.name).optional(),
  gender: z.string().max(STORAGE_LIMITS.name).optional(),
  picture: z.string().max(STORAGE_LIMITS.url).optional(),
  avatarPicture: z.string().max(STORAGE_LIMITS.url).optional(),

  // Libraries
  allowedLibraries: z.array(z.string().max(32)).max(100).optional(),
  allowedLibraryCollections: z.array(z.string().max(32)).max(100).optional(),

  // Stats that are computed and denormalised outside of recomputation
  denormalizedStats: z
    .object({
      // Sum of all XP gained by this character
      xp: z.number().int().default(0),
      // Sum of all levels granted by milestone XP
      milestoneLevels: z.number().int().default(0),
    })
    .prefault({}),
  propCount: z.number().int().default(0),
  // Does the character need a recompute?
  dirty: z.boolean().optional(),
  // Version of computation engine that was last used to compute this creature
  computeVersion: z.string().optional(),
  type: z.enum(['pc', 'npc', 'monster']).default('pc'),
  computeErrors: z
    .array(
      z.object({
        type: z.string(),
        details: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .optional(),
  lastComputedAt: z.date().optional(),

  // Tabletop
  tabletopId: z.string().max(32).optional(),
  initiativeRoll: z.number().int().optional(),

  // Settings
  settings: z
    .object({
      //slowed down by carrying too much?
      useVariantEncumbrance: z.boolean().optional(),
      //hide spellcasting tab
      hideSpellcasting: z.boolean().optional(),
      //hide rest buttons
      hideRestButtons: z.boolean().optional(),
      // Swap around the modifier and stat
      swapStatAndModifier: z.boolean().optional(),
      // Hide all the unused stats
      hideUnusedStats: z.boolean().optional(),
      // Show the tree tab
      showTreeTab: z.boolean().optional(),
      // Hide the spells tab
      hideSpellsTab: z.boolean().optional(),
      // Hide calculation errors
      hideCalculationErrors: z.boolean().optional(),
      // How much each hitDice resets on a long rest
      hitDiceResetMultiplier: z.number().min(0).max(1).optional(),
      discordWebhook: z.string().max(STORAGE_LIMITS.url).optional(),
    })
    .default({}),

  // Color
  ...colorSchema.shape,

  // Sharing
  ...SharingSchema.shape,
});

export type CreatureId = string & z.BRAND<'CreatureId'>;
export type Creature = Simplify<
  { _id: CreatureId } & z.infer<typeof creatureSchema>
>;

//set up the collection for creatures
const Creatures = new Mongo.Collection<Creature>('creatures');
Creatures.attachSchema(creatureSchema);

export default Creatures;
export { creatureSchema as CreatureSchema };

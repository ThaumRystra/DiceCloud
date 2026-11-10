import { z } from 'zod';

export const initiativeSchema = z.object({
  active: z.boolean().default(false),
  roundNumber: z.int().default(0),
  initiativeNumber: z.int().optional(),
  activeCreature: z.string().max(32).optional(),
});

export const tabletopSchema = z.object({
  // Details
  name: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),

  // Permissions by userId
  owner: z.string(),
  gameMasters: z.array(z.string()).default([]),
  players: z.array(z.string()).default([]),
  spectators: z.array(z.string()).default([]),
  public: z.boolean().optional(),

  // Initiative
  initiative: initiativeSchema.default({ active: false, roundNumber: 0 }),

  // Denormalized fields
  propCount: z.int().default(0),
  creatureCount: z.int().default(0),
});

export type Initiative = z.infer<typeof initiativeSchema>;
export type Tabletop = z.infer<typeof tabletopSchema>;

import { z } from 'zod';
import { CreatureSchema } from '/imports/api/creature/creatures/Creatures';

export const archiveV3Schema = z.object({
  meta: z.object({
    type: z.literal('DiceCloud V2 Creature Archive'),
    schemaVersion: z.literal(3),
    archiveDate: z.date(),
  }),
  creature: CreatureSchema,
  properties: z.array(z.object({})),
  experiences: z.array(z.object({})),
  logs: z.array(z.object({})),
});

import { z } from 'zod';

export const removeCreatureFromTabletopArgsSchema = z.object({
  tabletopId: z.string().max(32),
  creatureIds: z.array(z.string().max(32)),
});

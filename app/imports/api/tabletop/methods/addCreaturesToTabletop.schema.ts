import { z } from 'zod';

export const addCreaturesToTabletopArgsSchema = z.object({
  creatureIds: z.array(z.string().max(32)).max(20),
  tabletopId: z.string().max(32),
});

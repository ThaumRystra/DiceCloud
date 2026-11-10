import { z } from 'zod';

export const removeTabletopArgsSchema = z.object({
  tabletopId: z.string().max(32),
});

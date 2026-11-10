import { z } from 'zod';

export const addCreaturesFromLibraryToTabletopArgsSchema = z.object({
  libraryNodeIds: z.array(z.string().max(32)),
  tabletopId: z.string().max(32),
});

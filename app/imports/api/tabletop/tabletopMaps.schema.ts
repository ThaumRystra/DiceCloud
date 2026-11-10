import { z } from 'zod';

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const tabletopMapSchema = z.object({
  name: z.string().optional(),
  texture: z.string().max(32),
  position: positionSchema.optional(),
  width: z.number(),
  height: z.number(),
  rotation: z.number().min(0).max(360),
  // If this map was copied from a library map, this ID will be set
  libraryMapId: z.string().max(32).optional(),
});

export type TabletopMap = z.infer<typeof tabletopMapSchema>;

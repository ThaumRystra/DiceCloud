import { z } from 'zod';

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const tabletopObjectSchema = z.object({
  name: z.string().optional(),
  texture: z.string().max(32),
  position: positionSchema.optional(),
  width: z.number(),
  height: z.number(),
  rotation: z.number().min(0).max(360),
});

export type TabletopObject = z.infer<typeof tabletopObjectSchema>;

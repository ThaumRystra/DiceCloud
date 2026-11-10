import { z } from 'zod';

export const messageSchema = z.object({
  tabletopId: z.string().max(32),
  content: z.string().max(1000),
  timestamp: z.date(),
  userId: z.string().max(32),
  username: z.string(),
});

export const sendMessageArgsSchema = z.object({
  content: z.string().max(1000),
  tabletopId: z.string().max(32),
});

export const removeMessagesArgsSchema = z.object({
  messageId: z.string().max(32),
});

export type Message = z.infer<typeof messageSchema>;

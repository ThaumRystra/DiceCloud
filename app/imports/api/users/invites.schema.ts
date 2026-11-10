import { z } from 'zod';

export const inviteSchema = z.object({
  _id: z.string().max(32),
  inviter: z.string().max(32),
  invitee: z.string().max(32).optional(),
  inviteToken: z.string().optional(),
  isFunded: z.boolean(),
  // The timestamp of when the invitee was confirmed
  dateConfirmed: z.date().optional(),
});

export type Invite = z.infer<typeof inviteSchema>;

// Arguments for the 'invites.getToken' ValidatedMethod
export const getInviteTokenArgsSchema = z.object({
  inviteId: z.string().max(32),
});

// Arguments for the 'invites.acceptToken' ValidatedMethod
export const acceptInviteTokenArgsSchema = z.object({
  inviteToken: z.string(),
});

// Arguments for the 'invites.revokeInvite' ValidatedMethod
export const revokeInviteArgsSchema = z.object({
  inviteId: z.string().max(32),
});

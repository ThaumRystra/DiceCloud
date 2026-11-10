import { z } from 'zod';

export const sharableCollectionReferenceSchema = z.object({
  id: z.string().max(32),
  collection: z.enum(['libraries', 'creatures']),
});

export const setPublicArgsSchema = z.object({
  docRef: sharableCollectionReferenceSchema,
  isPublic: z.boolean(),
});

export const setReadersCanCopyArgsSchema = z.object({
  docRef: sharableCollectionReferenceSchema,
  readersCanCopy: z.boolean(),
});

export const updateUserSharePermissionsArgsSchema = z.object({
  docRef: sharableCollectionReferenceSchema,
  userId: z.string().max(32),
  role: z.enum(['reader', 'writer', 'none']),
});

export const transferOwnershipArgsSchema = z.object({
  docRef: sharableCollectionReferenceSchema,
  userId: z.string().max(32),
});

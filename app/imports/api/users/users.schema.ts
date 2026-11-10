import { z } from 'zod';
import SimpleSchema from 'simpl-schema';

const defaultLibraries =
  (process.env.DEFAULT_LIBRARIES && process.env.DEFAULT_LIBRARIES.split(',')) ||
  [];
const defaultLibraryCollections =
  (process.env.DEFAULT_LIBRARY_COLLECTIONS &&
    process.env.DEFAULT_LIBRARY_COLLECTIONS.split(',')) ||
  [];

export const userSchema = z.object({
  username: z.string().min(4).max(30).optional(),
  emails: z
    .array(
      z.object({
        address: z.string().regex(SimpleSchema.RegEx.Email),
        verified: z.boolean(),
      }),
    )
    .optional(),
  registered_emails: z.array(z.record(z.string(), z.unknown())).optional(),
  createdAt: z.date(),
  services: z.record(z.string(), z.unknown()).optional(),
  heartbeat: z.date().optional(),
  apiKey: z.string().optional(),
  darkMode: z.boolean().optional(),
  subscribedLibraries: z
    .array(z.string().max(32))
    .max(100)
    .default(defaultLibraries),
  subscribedLibraryCollections: z
    .array(z.string().max(32))
    .max(100)
    .default(defaultLibraryCollections),
  subscribedCharacters: z.array(z.string().max(32)).max(100).default([]),
  fileStorageUsed: z.number().optional(),
  profile: z.record(z.string(), z.unknown()).optional(),
  preferences: z
    .object({
      swapAbilityScoresAndModifiers: z.boolean().optional(),
      hidePropertySelectDialogHelp: z.boolean().optional(),
    })
    .default({}),
});

export type UserId = string & z.BRAND<'UserId'>;
export type User = { _id: UserId } & z.infer<typeof userSchema>;

// Arguments for the 'users.setDarkMode' ValidatedMethod
export const setDarkModeArgsSchema = z.object({
  darkMode: z.boolean().optional(),
});

// Arguments for the 'users.sendVerificationEmail' ValidatedMethod
export const sendVerificationEmailArgsSchema = z.object({
  userId: z.string().optional(),
  address: z.string(),
});

// Arguments for the 'users.canPickUsername' / 'users.setUsername' ValidatedMethods
export const pickUsernameArgsSchema = userSchema.pick({ username: true });

// Arguments for the 'users.setPreference' ValidatedMethod
export const setPreferenceArgsSchema = z.object({
  preference: z.string(),
  value: z.boolean(),
});

// Arguments for the 'users.subscribeToLibrary' ValidatedMethod
export const subscribeToLibraryArgsSchema = z.object({
  libraryId: z.string().max(32),
  subscribe: z.boolean(),
});

// Arguments for the 'users.subscribeToLibraryCollection' ValidatedMethod
export const subscribeToLibraryCollectionArgsSchema = z.object({
  libraryCollectionId: z.string().max(32),
  subscribe: z.boolean(),
});

// Arguments for the 'users.findUserByUsernameOrEmail' ValidatedMethod
export const findUserByUsernameOrEmailArgsSchema = z.object({
  usernameOrEmail: z.string(),
});

import { includes } from 'lodash';
import type { Shared } from '/imports/api/sharing/SharingSchema';
import type { TreeDoc } from '/imports/api/parenting/ChildSchema';
import { Roles } from 'meteor/roles';
import { getDocByRefAsync } from '/imports/api/parenting/reference';
import type { Library } from '/imports/api/library/Libraries';
import type { Creature } from '/imports/api/creature/creatures/Creatures';

function assertIdValid(userId: string | undefined | null): asserts userId {
  if (!userId || typeof userId !== 'string') {
    throw new Meteor.Error('Permission denied',
      'No user ID. Are you logged in?');
  }
}

function assertDocExists(doc: Record<string, unknown> | undefined): asserts doc {
  if (!doc) {
    throw new Meteor.Error('Permission denied',
      'Permission denied: No such document exists');
  }
}

export function assertOwnership(doc: Shared | undefined, userId: string | undefined | null): asserts doc {
  assertIdValid(userId);
  assertDocExists(doc);

  if (doc.owner === userId) {
    return;
  } else {
    throw new Meteor.Error('Permission denied',
      'You are not the owner of this document');
  }
}

/**
 * Assert that the user can edit the root document which manages its own sharing
 * permissions.
 *
 * Warning: the doc and userId must be set by a trusted source
 */
export async function assertEditPermission(doc: Shared | undefined, userId: string | undefined | null): Promise<void> {
  assertIdValid(userId);
  assertDocExists(doc);
  const user = await Meteor.users.findOneAsync(userId);
  if (!user) {
    throw new Meteor.Error('Edit permission denied',
      'No such user exists');
  }

  // Admin override
  if (await Roles.userIsInRoleAsync(user, 'admin')) {
    return;
  }

  // Ensure the user is authorized for this specific document
  if (
    doc.owner === userId ||
    includes(doc.writers, userId)
  ) {
    return;
  } else {
    throw new Meteor.Error('Edit permission denied',
      'You do not have permission to edit this document');
  }
}

/**
 * Assert that the user can edit the root document which manages its own sharing
 * permissions.
 *
 * Warning: the doc and userId must be set by a trusted source
 */
export async function assertCopyPermission(doc: Shared | undefined, userId: string | undefined | null): Promise<void> {
  assertIdValid(userId);
  assertDocExists(doc);
  const user = await Meteor.users.findOneAsync(userId, {
    fields: {
      'roles': 1,
    }
  });

  if (!user) {
    throw new Meteor.Error('Edit permission denied',
      'No such user exists');
  }

  // Admin override
  if (Roles.userIsInRole(user, 'admin')) {
    return;
  }

  // Ensure the user is authorized for this specific document
  if (
    doc.owner === userId ||
    includes(doc.writers, userId)
  ) {
    return;
  } else if (
    (includes(doc.readers, userId) || doc.public) &&
    doc.readersCanCopy
  ) {
    return;
  } else {
    throw new Meteor.Error('Copy permission denied',
      'You do not have permission to copy this document');
  }
}

async function getRoot(doc: TreeDoc | Shared | undefined): Promise<Shared | undefined> {
  assertDocExists(doc);
  if ('root' in doc) {
    return await getDocByRefAsync(doc.root) as Library | Creature;
  } else {
    return doc;
  }
}

/**
 * Assert that the user can edit a descendant document whose root ancestor
 * implements sharing permissions.
 *
 * Warning: the doc and userId must be set by a trusted source
 */
export async function assertDocEditPermission(doc: TreeDoc | Shared | undefined, userId: string | null): Promise<void> {
  const root = await getRoot(doc);
  await assertEditPermission(root, userId);
}

/**
 * Assert that the user can copy a descendant document whose root ancestor
 * implements sharing permissions.
 *
 * Warning: the doc and userId must be set by a trusted source
 */
export async function assertDocCopyPermission(doc: TreeDoc, userId: string): Promise<void> {
  const root = await getRoot(doc);
  await assertCopyPermission(root, userId);
}

export async function assertViewPermission(doc: Shared | undefined, userId: string | undefined | null): Promise<void> {
  assertDocExists(doc);
  if (doc.public) return;
  assertIdValid(userId);

  if (
    doc.owner === userId ||
    includes(doc.readers, userId) ||
    includes(doc.writers, userId)
  ) {
    return;
  }

  // Admin override
  if (await Roles.userIsInRoleAsync(userId, 'admin')) {
    return;
  }

  throw new Meteor.Error('View permission denied',
    'You do not have permission to view this document');

}

/**
 * Assert that the user can view a descendant document whose root ancestor
 * implements sharing permissions.
 *
 * Warning: the doc and userId must be set by a trusted source
 */
export async function assertDocViewPermission(doc: Shared, userId: string | undefined | null): Promise<void> {
  const root = await getRoot(doc);
  await assertViewPermission(root, userId);
}

export async function assertAdmin(userId: string | undefined | null): Promise<void> {
  assertIdValid(userId);
  const isAdmin = await Roles.userIsInRoleAsync(userId, 'admin');
  if (!isAdmin) {
    throw new Meteor.Error('permission-denied',
      'User does not have the admin role');
  }
}

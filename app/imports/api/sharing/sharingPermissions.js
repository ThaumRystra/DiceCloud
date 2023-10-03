import { includes } from 'lodash';
import { fetchDocByRef } from '/imports/api/parenting/parentingFunctions';

function assertIdValid(userId) {
  if (!userId || typeof userId !== 'string') {
    throw new Meteor.Error('Permission denied',
      'No user ID. Are you logged in?');
  }
}

function assertdocExists(doc) {
  if (!doc) {
    throw new Meteor.Error('Permission denied',
      'Permission denied: No such document exists');
  }
}

export function assertOwnership(doc, userId) {
  assertIdValid(userId);
  assertdocExists(doc);

  if (doc.owner === userId) {
    return true;
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
export function assertEditPermission(doc, userId) {
  assertIdValid(userId);
  assertdocExists(doc);
  const user = Meteor.users.findOne(userId, {
    fields: {
      'roles': 1,
    }
  });

  // Admin override
  if (user.roles && user.roles.includes('admin')) {
    return true;
  }

  // Ensure the user is authorized for this specific document
  if (
    doc.owner === userId ||
    includes(doc.writers, userId)
  ) {
    return true;
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
export function assertCopyPermission(doc, userId) {
  assertIdValid(userId);
  assertdocExists(doc);
  const user = Meteor.users.findOne(userId, {
    fields: {
      'roles': 1,
    }
  });

  // Admin override
  if (user.roles && user.roles.includes('admin')) {
    return true;
  }

  // Ensure the user is authorized for this specific document
  if (
    doc.owner === userId ||
    includes(doc.writers, userId)
  ) {
    return true;
  } else if (
    (includes(doc.readers, userId) || doc.public) &&
    doc.readersCanCopy
  ) {
    return true;
  } else {
    throw new Meteor.Error('Copy permission denied',
      'You do not have permission to copy this document');
  }
}

function getRoot(doc) {
  assertdocExists(doc);
  if (doc.root) {
    return fetchDocByRef(doc.root);
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
export function assertDocEditPermission(doc, userId) {
  let root = getRoot(doc);
  assertEditPermission(root, userId);
}

/**
 * Assert that the user can copy a descendant document whose root ancestor
 * implements sharing permissions.
 *
 * Warning: the doc and userId must be set by a trusted source
 */
export function assertDocCopyPermission(doc, userId) {
  let root = getRoot(doc);
  assertCopyPermission(root, userId);
}

export function assertViewPermission(doc, userId) {
  assertdocExists(doc);
  if (doc.public) return true;
  assertIdValid(userId);

  if (
    doc.owner === userId ||
    includes(doc.readers, userId) ||
    includes(doc.writers, userId)
  ) {
    return true;
  } else {

    // Admin override
    const user = Meteor.users.findOne(userId, {
      fields: {
        'roles': 1,
      }
    });
    if (user.roles && user.roles.includes('admin')) {
      return true;
    }

    throw new Meteor.Error('View permission denied',
      'You do not have permission to view this document');
  }
}

/**
 * Assert that the user can view a descendant document whose root ancestor
 * implements sharing permissions.
 *
 * Warning: the doc and userId must be set by a trusted source
 */
export function assertDocViewPermission(doc, userId) {
  let root = getRoot(doc);
  assertViewPermission(root, userId);
}

export function assertAdmin(userId) {
  assertIdValid(userId);
  let user = Meteor.users.findOne(userId, { fields: { roles: 1 } });
  if (!user) {
    throw new Meteor.Error('Permission denied',
      'UserId does not match any existing user');
  }
  let isAdmin = user.roles && user.roles.includes('admin')
  if (!isAdmin) {
    throw new Meteor.Error('Permission denied',
      'User does not have the admin role');
  }
}

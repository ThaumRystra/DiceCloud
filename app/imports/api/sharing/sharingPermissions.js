import { _ } from 'meteor/underscore';
import fetchDocByRef from '/imports/api/parenting/fetchDocByRef.js';
import { getUserTier } from '/imports/api/users/patreon/tiers.js';

function assertIdValid(userId){
  if (!userId || typeof userId !== 'string'){
    throw new Meteor.Error('Permission denied',
      'No user ID given for edit permission check');
  }
}

function assertdocExists(doc){
  if (!doc){
    throw new Meteor.Error('Permission denied',
      'No such document exists');
  }
}

export function assertOwnership(doc, userId){
  assertIdValid(userId);
  assertdocExists(doc);
  if (doc.owner === userId ){
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
  let user = Meteor.users.findOne(userId, {
    fields: {
      'services.patreon': 1,
      'roles': 1,
    }
  });

  // Admin override
  if (user.roles && user.roles.includes('admin')){
    return true;
  }

  // Ensure the user is of a tier with paid benefits
  let tier = getUserTier(user);
  if (!tier.paidBenefits){
    throw new Meteor.Error('Edit permission denied',
      `The ${tier.name} tier does not allow you to edit this document`);
  }

  // Ensure the user is authorized for this specific document
  if (
    doc.owner === userId ||
    _.contains(doc.writers, userId)
  ){
    return true;
  } else {
    throw new Meteor.Error('Edit permission denied',
      'You do not have permission to edit this document');
  }
}

function getRoot(doc){
  assertdocExists(doc);
  if (doc.ancestors && doc.ancestors.length && doc.ancestors[0]){
    return fetchDocByRef(doc.ancestors[0]);
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
export function assertDocEditPermission(doc, userId){
  let root = getRoot(doc);
  assertEditPermission(root, userId);
}

export function assertViewPermission(doc, userId) {
  assertIdValid(userId);
  assertdocExists(doc);
  if (
    doc.owner === userId ||
    doc.public ||
    _.contains(doc.readers, userId) ||
    _.contains(doc.writers, userId)
  ){
    return true;
  } else {
    throw new Meteor.Error('View permission denied',
      'You do not have permission to view this character');
  }
}

/**
 * Assert that the user can view a descendant document whose root ancestor
 * implements sharing permissions.
 *
 * Warning: the doc and userId must be set by a trusted source
 */
export function assertDocViewPermission(doc, userId){
  let root = getRoot(doc);
  assertViewPermission(root, userId);
}

export function assertAdmin(userId){
  assertIdValid(userId);
  let user = Meteor.users.findOne(userId, {fields: {roles: 1}});
  if (!user){
    throw new Meteor.Error('Permission denied',
      'UserId does not match any existing user');
  }
  let isAdmin = user.roles && user.roles.includes('admin')
  if (!isAdmin){
    throw new Meteor.Error('Permission denied',
      'User does not have the admin role');
  }
}

import { _ } from 'meteor/underscore';

function assertIdValid(userId){
  if (!userId || typeof userId !== 'string'){
    throw new Meteor.Error("Permission denied",
      "No user ID given for edit permission check");
  }
};

function assertdocExists(doc){
  if (!doc){
    throw new Meteor.Error("Edit permission denied",
      `No doc exists with the given id: ${charId}`);
  }
};

export function assertOwnership(doc, userId){
  assertIdValid(userId);
  assertdocExists(doc);
  if (doc.owner === userId ){
    return true;
  } else {
    throw new Meteor.Error("Permission denied",
      `You are not the owner of this doc`);
  }
}

export function assertEditPermission(doc, userId) {
  assertIdValid(userId);
  assertdocExists(doc);
  if (doc.owner === userId || _.contains(doc.writers, userId)){
    return true;
  } else {
    throw new Meteor.Error("Edit permission denied",
      `You do not have permission to edit this character`);
  }
};

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
    throw new Meteor.Error("View permission denied",
      `You do not have permission to view this character`);
  }
};

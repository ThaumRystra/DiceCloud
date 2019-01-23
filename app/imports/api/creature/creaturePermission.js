import Creatures from '/imports/api/creature/Creatures.js';
import { _ } from 'meteor/underscore';

export function canEditCreature(charId, userId) {
  if (!charId || typeof charId !== 'string'){
    throw new Meteor.Error("Edit permission denied",
      "No creature ID given for edit permission check");
  }
  if (!userId || typeof userId !== 'string'){
    throw new Meteor.Error("Edit permission denied",
      "No user ID given for edit permission check");
  }
  let creature = Creatures.findOne(charId, {fields: {owner: 1, writers: 1}});
  if (!creature){
    throw new Meteor.Error("Edit permission denied",
      `No creature exists with the given id: ${charId}`);
  }
  if (creature.owner === userId || _.contains(creature.writers, userId)){
    return true;
  } else {
    throw new Meteor.Error("Edit permission denied",
      `You do not have permission to edit this character`);
  }
};

export function canViewCreature(charId, userId) {
  if (!charId || typeof charId !== 'string'){
    throw new Meteor.Error("View permission denied",
      "No creature ID given for view permission check");
  }
  if (!userId || typeof userId !== 'string'){
    throw new Meteor.Error("View permission denied",
      "No user ID given for view permission check");
  }
  let creature = Creatures.findOne(charId, {
    fields: {owner: 1, writers: 1, readers: 1, settings: 1}
  });
  if (!creature){
    throw new Meteor.Error("View permission denied",
      `No creature exists with the given id: ${charId}`);
  }
  if (
    creature.owner === userId ||
    settings.viewPermission === 'public' ||
    _.contains(creature.readers, userId) ||
    _.contains(creature.writers, userId)
  ){
    return true;
  } else {
    throw new Meteor.Error("View permission denied",
      `You do not have permission to view this character`);
  }
};

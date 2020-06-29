import Creatures from '/imports/api/creature/Creatures.js';
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';

export default function getActiveProperties({
  ancestorId,
  filter = {},
  options = {sort: {order: 1}},
  includeUntoggled = false,
  excludeAncestors,
}){
  filter = getActivePropertyFilter({
    ancestorId,
    filter,
    includeUntoggled,
    excludeAncestors,
  });
  return CreatureProperties.find(filter, options).fetch();
}

export function getActivePropertyFilter({
  ancestorId,
  filter = {},
  includeUntoggled = false,
  excludeAncestors = [],
}){
  if (!ancestorId){
    throw 'Ancestor Id is required to get active properties'
  }
  // First get ids of disabled properties, unequiped items, unapplied buffs
  let disabledAncestorsFilter = {
    'ancestors.id': ancestorId,
    $or: [
      {disabled: true}, // Everything can be disabled
      {equipped: false}, // Items can be equipped
      {applied: false}, // Buffs can be applied
    ],
  };
  if (!includeUntoggled){
    disabledAncestorsFilter.$or.push({toggleResult: false});
  }
  let disabledAncestorIds = CreatureProperties.find(disabledAncestorsFilter, {
    fields: {_id: 1},
  }).map(prop => prop._id);

  // Then get the ids of creatures that are children of this creature
  // to isolate their decendent properties
  Creatures.find({
    'ancestors.id': ancestorId,
  }, {
    fields: {_id: 1},
  }).forEach(subCreature => {
    disabledAncestorIds.push(subCreature._id);
  });

  // Get all the properties that are decendents of the ancestor of interest but
  // aren't from the excluded decendents
  if (filter['ancestors.id'] && Meteor.isClient){
    console.warn('Filtering on ancestor id is ignored')
  }
  filter['ancestors.id'] = {
    $eq: ancestorId,
    $nin: disabledAncestorIds.concat(excludeAncestors),
  };
  // Get properties that aren't removed
  filter.removed = {$ne: true};
  // Don't include the disabled ancestors themselves either
  filter._id = {
    $nin: disabledAncestorIds,
  }
  return filter;
}

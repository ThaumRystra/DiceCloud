import Creatures from '/imports/api/creature/Creatures.js';
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';

export default function getActiveProperties({
  ancestorId,
  filter = {},
  options,
  includeUntoggled = false
}){
  if (!ancestorId){
    throw 'Ancestor Id is required to get active properties'
  }
  // First get ids of disabled properties, unequiped items, unapplied buffs
  let disabledAncestorsFilter = {
    'ancestors.id': ancestorId,
    $or: [
      {disabled: true},
      {equipped: false},
      {applied: false},
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
  }).forEach(prop => {
    disabledAncestorIds.push(prop._id);
  });

  // Get all the properties that aren't from the excluded decendents
  filter['ancestors.id'] = {
    $eq: ancestorId,
    $nin: disabledAncestorIds,
  };
  filter.removed = {$ne: true};
  return CreatureProperties.find(filter, options).fetch();
}

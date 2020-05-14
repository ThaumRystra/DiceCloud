import Creatures from '/imports/api/creature/Creatures.js';
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';

export default function getCalculationProperties(creatureId, types){
  // First get ids of disabled properties and unequiped items
  let disabledAncestorIds = CreatureProperties.find({
    'ancestors.id': creatureId,
    $or: [
      {disabled: true},
      {equipped: false},
    ],
  }, {
    fields: {_id: 1},
  }).map(prop => prop._id);

  // Then get the ids of creatures that are children of this creature
  // to isolate their decendent properties from this calculation
  Creatures.find({
    'ancestors.id': creatureId,
  }, {
    fields: {_id: 1},
  }).forEach(prop => {
    disabledAncestorIds.push(prop._id);
  });

  // Get all the properties that aren't from the excluded decendents
  return CreatureProperties.find({
    'ancestors.id': {
      $eq: creatureId,
      $nin: disabledAncestorIds,
    },
    removed: {$ne: true},
    type: {$in: types || [
      'attribute',
      'skill',
      'damageMultiplier',
      'effect',
      'proficiency',
      'classLevel',
    ]},
  }).fetch();
}

import CreatureProperties from '/imports/api/creature/CreatureProperties.js';

export default function getComputationProperties(creatureId){
  // find ids of all toggles that have conditions, even if they are inactive
  let toggleIds = CreatureProperties.find({
    'ancestors.id': creatureId,
    type: 'toggle',
    removed: {$ne: true},
    condition: { $exists: true },
  }, {
    fields: {_id: 1},
  }).map(t => t._id);
  // Find all the relevant properties
  return CreatureProperties.find({
    'ancestors.id': creatureId,
    removed: {$ne: true},
    $or: [
      // All active properties
      {inactive: {$ne: true}},
      // All active and inactive toggles with conditions
      // Same as {$in: toggleIds}, but should be slightly faster
      {type: 'toggle', condition: { $exists: true }},
      // All decendents of the above toggles
      {'ancestors.id': {$in: toggleIds}},
    ]
  }, {
    // Filter out fields never used by calculations
    fields: {
      icon: 0,
    },
    sort: {
      order: 1,
    }
  }).fetch();
}

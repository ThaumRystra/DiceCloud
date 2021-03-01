import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';

export default function getComputationProperties(creatureId){
  // Find all the relevant properties
  return CreatureProperties.find({
    'ancestors.id': creatureId,
    removed: {$ne: true},
    $or: [
      // All active properties
      {inactive: {$ne: true}},
      // Unless they were deactivated because of a toggle
      {deactivatedByToggle: true},
    ]
  }, {
    // Filter out fields never used by calculations
    fields: {
      icon: 0,
    },
    // Obey tree order
    sort: {
      order: 1,
    }
  }).fetch();
}

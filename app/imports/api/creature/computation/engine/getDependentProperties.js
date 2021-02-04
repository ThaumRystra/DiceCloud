import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';

export default function getDependentProperties({creatureId, dependencies}){
  // find ids of all dependant toggles that have conditions, even if inactive
  let toggleIds = CreatureProperties.find({
    'ancestors.id': creatureId,
    type: 'toggle',
    removed: {$ne: true},
    condition: { $exists: true },
    dependencies: {$in: dependencies},
  }, {
    fields: {_id: 1},
  }).map(t => t._id);
  // Find all the dependant properties
  let props = CreatureProperties.find({
    'ancestors.id': creatureId,
    removed: {$ne: true},
    dependencies: {$in: dependencies},
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
  // Add on all the properties th
  CreatureProperties.find({_id: {$in: dependencies}}).forEach(prop => {
    props.push(prop)
  });
  return props;
}

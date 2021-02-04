import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { union } from 'lodash';

export default function getDependentProperties({
  creatureId,
  propertyIds,
  propertiesDependedAponIds,
 }){
  // find ids of all dependant toggles that have conditions, even if inactive
  let toggleIds = CreatureProperties.find({
    'ancestors.id': creatureId,
    type: 'toggle',
    removed: {$ne: true},
    condition: { $exists: true },
    dependencies: {$in: propertyIds},
  }, {
    fields: {_id: 1},
  }).map(t => t._id);
  // Find all the dependant properties
  let props = CreatureProperties.find({
    'ancestors.id': creatureId,
    removed: {$ne: true},
    dependencies: {$in: propertyIds},
    $or: [
      // All active properties
      {inactive: {$ne: true}},
      // All active and inactive toggles with conditions
      // Same as {$in: toggleIds}, but should be slightly faster
      {type: 'toggle', condition: { $exists: true }},
      // All decendents of the above toggles
      {'ancestors.id': {$in: toggleIds}},
    ]
  }, { fields: {_id: 1, dependencies: 1} }).fetch();
  // Add all the properties that changing props depend on, but haven't yet been
  // included to make an array of every property we need
  let allConnectedPropIds = [...propertyIds, ...propertiesDependedAponIds];
  props.forEach(prop => {
    allConnectedPropIds = union(
      allConnectedPropIds,
      prop.dependencies,
      [prop._id]);
  });
  // Add on all the properties and the objects they depend apon
  return CreatureProperties.find({
    _id: {$in: allConnectedPropIds}
  }, {
    // Ignore fields not used in computations
    fields: {icon: 0},
    sort: {order: 1},
  }).fetch();
}

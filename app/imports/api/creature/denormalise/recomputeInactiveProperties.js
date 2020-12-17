import CreatureProperties from '/imports/api/creature/CreatureProperties.js';

export default function recomputeInactiveProperties(ancestorId){
  let disabledFilter = {
    'ancestors.id': ancestorId,
    $or: [
      {disabled: true}, // Everything can be disabled
      {type: 'buff', applied: false}, // Buffs can be applied
      {type: 'item', equipped: {$ne: true}},
      {type: 'spell', prepared: {$ne: true}, alwaysPrepared: {$ne: true}},
    ],
  };
  let disabledIds = CreatureProperties.find(disabledFilter, {
    fields: {_id: 1},
  }).map(prop => prop._id);

  // Set all the properties inactive that aren't already inactive but should be
  CreatureProperties.update({
    'ancestors.id': ancestorId,
    $or: [{
      '_id': {$in: disabledIds}
    }, {
      'ancestors.id': {$in: disabledIds}
    }],
    inactive: {$ne: true},
  }, {
    $set: {inactive: true},
  }, {
    multi: true,
    selector: {type: 'any'},
  });
  // Remove inactive from all the properties that are inactive but shouldn't be
  CreatureProperties.update({
    'ancestors.id': {$eq: ancestorId, $nin: disabledIds},
    '_id': {$nin: disabledIds},
    inactive: true,
  }, {
    $unset: {inactive: 1},
  }, {
    multi: true,
    selector: {type: 'any'},
  });
}

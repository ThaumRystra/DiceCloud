import CreatureProperties from '/imports/api/creature/CreatureProperties.js';

export default function recomputeInactiveProperties(ancestorId){
  let disabledFilter = {
    'ancestors.id': ancestorId,
    $or: [
      {disabled: true}, // Everything can be disabled
      {type: 'buff', applied: false}, // Buffs can be applied
      {type: 'item', equipped: {$ne: true}},
      {type: 'toggle', toggleResult: false},
      {type: 'spell', prepared: {$ne: true}, alwaysPrepared: {$ne: true}},
    ],
  };
  let disabledIds = CreatureProperties.find(disabledFilter, {
    fields: {_id: 1},
  }).map(prop => prop._id);

  // Deactivate relevant properties
  // Inactive properties
  CreatureProperties.update({
    'ancestors.id': ancestorId,
    '_id': {$in: disabledIds},
    $or: [{inactive: {$ne: true}}, {deactivatedByAncestor: true}],
  }, {
    $set: {inactive: true},
    $unset: {deactivatedByAncestor: 1},
  }, {
    multi: true,
    selector: {type: 'any'},
  });
  // Decendants of inactive properties
  CreatureProperties.update({
    'ancestors.id': {$eq: ancestorId, $in: disabledIds},
    $or: [{inactive: {$ne: true}}, {deactivatedByAncestor: {$ne: true}}],
  }, {
    $set: {
      inactive: true,
      deactivatedByAncestor: true,
    },
  }, {
    multi: true,
    selector: {type: 'any'},
  });

  // Remove inactive from all the properties that are inactive but shouldn't be
  CreatureProperties.update({
    'ancestors.id': {$eq: ancestorId, $nin: disabledIds},
    '_id': {$nin: disabledIds},
    $or: [{inactive: true}, {deactivatedByAncestor: true}],
  }, {
    $unset: {
      inactive: 1,
      deactivatedByAncestor: 1,
    },
  }, {
    multi: true,
    selector: {type: 'any'},
  });
}

import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';

export default function getParentRefByTag(creatureId, tag){
  let prop = CreatureProperties.findOne({
    'ancestors.id': creatureId,
    removed: {$ne: true},
    inactive: {$ne: true},
    tags: tag,
  }, {
    sort: {order: 1},
  });
  return prop && {id: prop._id, collection: 'creatureProperties'};
}

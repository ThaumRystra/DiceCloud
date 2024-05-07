import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

export default function getParentRefByTag(creatureId, tag) {
  let prop = CreatureProperties.findOne({
    ...getFilter.descendantsOfRoot(creatureId),
    removed: { $ne: true },
    inactive: { $ne: true },
    tags: tag,
  }, {
    sort: { left: 1 },
  });
  return prop && { id: prop._id, collection: 'creatureProperties' };
}

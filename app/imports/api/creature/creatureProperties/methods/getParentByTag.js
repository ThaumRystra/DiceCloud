import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

export default function getParentByTag(creatureId, tag) {
  return CreatureProperties.findOne({
    ...getFilter.descendantsOfRoot(creatureId),
    removed: { $ne: true },
    inactive: { $ne: true },
    tags: tag,
  }, {
    sort: { left: 1 },
  });
}

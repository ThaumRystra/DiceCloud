import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

export default function getParentByTag(rootId: string, tag: string) {
  return CreatureProperties.findOneAsync({
    ...getFilter.descendantsOfRoot(rootId),
    removed: { $ne: true },
    inactive: { $ne: true },
    tags: tag,
  }, {
    sort: { left: 1 },
  });
}

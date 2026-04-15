import { getCreature } from '/imports/api/engine/loadCreatures';
import type { TreeDoc } from '/imports/api/parenting/ChildSchema';

export default function getRootCreatureAncestor(property: TreeDoc) {
  return getCreature(property.root.id);
}

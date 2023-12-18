import { getCreature } from '/imports/api/engine/loadCreatures';

export default function getRootCreatureAncestor(property) {
  return getCreature(property.root.id);
}

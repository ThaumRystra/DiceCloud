import Creatures from '/imports/api/creature/creatures/Creatures';

export default function getRootCreatureAncestor(property) {
  return Creatures.findOne(property.ancestors[0].id);
}

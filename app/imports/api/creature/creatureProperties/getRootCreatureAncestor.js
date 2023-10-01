import Creatures from '/imports/api/creature/creatures/Creatures';

export default function getRootCreatureAncestor(property) {
  if (property.root?.collection !== 'creatures') {
    throw 'Property does not have a root ancestor'
  }
  return Creatures.findOne(property.root.id);
}

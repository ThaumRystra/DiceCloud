import Creatures from '/imports/api/creature/creatures/Creatures.js';

export default function getRootCreatureAncestor(property){
  return Creatures.findOne(property.ancestors[0].id);
}

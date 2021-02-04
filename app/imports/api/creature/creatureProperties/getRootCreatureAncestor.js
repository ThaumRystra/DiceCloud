import Creatures from '/imports/api/creature/Creatures.js';

export default function getRootCreatureAncestor(property){
  return Creatures.findOne(property.ancestors[0].id);
}

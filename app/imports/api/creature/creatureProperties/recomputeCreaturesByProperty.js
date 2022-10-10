import computeCreature from '/imports/api/engine/computeCreature.js';

/**
 * Recomputes all ancestor creatures of this property
 */
export default function recomputeCreaturesByProperty(property){
  for (let ref of property.ancestors){
    if (ref.collection === 'creatures') {
      computeCreature.call(ref.id);
    }
  }
}

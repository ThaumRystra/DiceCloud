import { recomputeCreatureById } from '/imports/api/creature/computation/methods/recomputeCreature.js';

/**
 * Recomputes all ancestor creatures of this property
 */
export default function recomputeCreaturesByProperty(property){
	for (let ref of property.ancestors){
		if (ref.collection === 'creatures') {
			recomputeCreatureById.call(ref.id);
		}
	}
}

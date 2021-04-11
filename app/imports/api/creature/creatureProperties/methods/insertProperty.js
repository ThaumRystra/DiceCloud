import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import { reorderDocs } from '/imports/api/parenting/order.js';
import recomputeInactiveProperties from '/imports/api/creature/denormalise/recomputeInactiveProperties.js';
import { recomputeCreatureByDoc } from '/imports/api/creature/computation/methods/recomputeCreature.js';
import recomputeInventory from '/imports/api/creature/denormalise/recomputeInventory.js';
import { getAncestry } from '/imports/api/parenting/parenting.js';

const insertProperty = new ValidatedMethod({
  name: 'creatureProperties.insert',
	validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({creatureProperty, parentRef}) {
    // get the new ancestry for the properties
		let {parentDoc, ancestors} = getAncestry({parentRef});

		// Check permission to edit
    let rootCreature;
		if (parentRef.collection === 'creatures'){
      rootCreature = parentDoc;
		} else if (parentRef.collection === 'creatureProperties'){
      rootCreature = getRootCreatureAncestor(parentDoc);
		} else {
			throw `${parentRef.collection} is not a valid parent collection`
		}
    assertEditPermission(rootCreature, this.userId);

    creatureProperty.parent = parentRef;
    creatureProperty.ancestors = ancestors;

		return insertPropertyWork({
      property: creatureProperty,
      creature: rootCreature,
    });
  },
});

export function insertPropertyWork({property, creature}){
  delete property._id;
  let _id = CreatureProperties.insert(property);
  // Tree structure changed by insert, reorder the tree
  reorderDocs({
    collection: CreatureProperties,
    ancestorId: creature._id,
  });
  // Inserting the active status of the property needs to be denormalised
  recomputeInactiveProperties(creature._id);

  // Recompute the inventory if it has changed
  if (property.type === 'item' || property.type === 'container'){
    recomputeInventory(creature._id);
  }
  // Inserting a creature property invalidates dependencies: full recompute
  recomputeCreatureByDoc(creature);
  return _id;
}

export default insertProperty;

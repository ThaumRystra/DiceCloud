import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import { RefSchema } from '/imports/api/parenting/ChildSchema.js';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import recomputeInactiveProperties from '/imports/api/creature/denormalise/recomputeInactiveProperties.js';
import { recomputeCreatureByDoc } from '/imports/api/creature/computation/methods/recomputeCreature.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import {
	setLineageOfDocs,
	getAncestry,
	renewDocIds
} from '/imports/api/parenting/parenting.js';
import { reorderDocs } from '/imports/api/parenting/order.js';
import { setDocToLastOrder } from '/imports/api/parenting/order.js';

const insertPropertyFromLibraryNode = new ValidatedMethod({
	name: 'creatureProperties.insertPropertyFromLibraryNode',
	validate: new SimpleSchema({
		nodeId: {
			type: String,
			regEx: SimpleSchema.RegEx.Id,
		},
		parentRef: {
			type: RefSchema,
		},
	}).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
	run({nodeId, parentRef}) {
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

		// Fetch the library node and its decendents, provided they have not been
		// removed
		let node = LibraryNodes.findOne({
			_id: nodeId,
			removed: {$ne: true},
		});
		if (!node) throw `Node not found for nodeId: ${nodeId}`;
		let oldParent = node.parent;
		let nodes = LibraryNodes.find({
			'ancestors.id': nodeId,
			removed: {$ne: true},
		}).fetch();

    // The root node is first in the array of nodes
    // It must get the first generated ID to prevent flickering
		nodes = [node, ...nodes];

		// re-map all the ancestors
		setLineageOfDocs({
			docArray: nodes,
			newAncestry: ancestors,
			oldParent,
		});

		// Give the docs new IDs without breaking internal references
		renewDocIds({
			docArray: nodes,
			collectionMap: {'libraryNodes': 'creatureProperties'}
		});

		// Order the root node
		setDocToLastOrder({
			collection: CreatureProperties,
			doc: node,
		});

		// Insert the creature properties
    CreatureProperties.batchInsert(nodes);

    // get the root inserted doc
    let rootId = node._id;

    // Tree structure changed by inserts, reorder the tree
    reorderDocs({
      collection: CreatureProperties,
      ancestorId: rootCreature._id,
    });

    // The library properties need to denormalise which of them are inactive
    recomputeInactiveProperties(rootId);
		// Inserting a creature property invalidates dependencies: full recompute
    recomputeCreatureByDoc(rootCreature);
		// Return the docId of the last property, the inserted root property
		return rootId;
	},
});

export default insertPropertyFromLibraryNode;

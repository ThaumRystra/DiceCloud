import SimpleSchema from 'simpl-schema';
import ChildSchema, { RefSchema } from '/imports/api/parenting/ChildSchema.js';
import Creature from '/imports/api/creature/Creatures.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import propertySchemasIndex from '/imports/api/properties/propertySchemasIndex.js';
import {
	setLineageOfDocs,
	getAncestry,
	renewDocIds
} from '/imports/api/parenting/parenting.js';
import {setDocToLastOrder} from '/imports/api/parenting/order.js';

let CreatureProperties = new Mongo.Collection('creatureProperties');

let CreaturePropertySchema = new SimpleSchema({
	type: {
    type: String,
    allowedValues: Object.keys(propertySchemasIndex),
  },
	tags: {
		type: Array,
		defaultValue: [],
	},
	'tags.$': {
		type: String,
	},
});

for (let key in propertySchemasIndex){
	let schema = new SimpleSchema({});
	schema.extend(propertySchemasIndex[key]);
	schema.extend(CreaturePropertySchema);
	schema.extend(ChildSchema);
	CreatureProperties.attachSchema(schema, {
		selector: {type: key}
	});
}

function getCreature(property){
  if (!property) throw new Meteor.Error('No property provided');
  let creature = Creatures.findOne(property.ancestors[0].id);
  if (!creature) throw new Meteor.Error('Creature does not exist');
  return creature;
}

function assertPropertyEditPermission(property, userId){
  let creature = getCreature(property);
  return assertEditPermission(creature, userId);
}

const insertProperty = new ValidatedMethod({
  name: 'CreatureProperties.methods.insert',
	validate: null,
  run({creatureProperty, parentRef}) {
		// TODO insert a property with the correct ancestry and order
    //assertPropertyEditPermission(creatureProperty, this.userId);
		//return CreatureProperties.insert(creatureProperty);
		// TODO trigger a recalculation of the creature
  },
});

const insertPropertyFromLibraryNode = new ValidatedMethod({
	name: 'CreatureProperties.methods.insertPropertyFromLibraryNode',
	validate: new SimpleSchema({
		nodeId: {
			type: String,
			regEx: SimpleSchema.RegEx.Id,
		},
		parentRef: {
			type: RefSchema,
		},
	}).validator(),
	run({nodeId, parentRef}) {
		// get the new ancestry for the properties
		let {parentDoc, ancestors} = getAncestry({parentRef});

		// Check permission to edit
		if (parentRef.collection === 'creatures'){
			assertEditPermission(parentDoc, this.userId);
		} else if (parentRef.collection === 'creatureProperties'){
			assertPropertyEditPermission(parentDoc, this.userId);
		} else {
			throw `${parentRef.collection} is not a valid parent collection`
		}

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
		// The root node is last in the array of nodes
		nodes.push(node);

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
		let docId;
		nodes.forEach(doc => {
			docId = CreatureProperties.insert(doc);
		});

		// TODO trigger a recalculation of the creature

		// Return the docId of the last property, the inserted root property
		return docId;
	},
})

/*
const adjustAttribute = new ValidatedMethod({
  name: 'Attributes.methods.adjust',
  mixins: [
    simpleSchemaMixin,
    creaturePermissionMixin,
  ],
  collection: Attributes,
  permission: 'edit',
  schema: new SimpleSchema({
    _id: SimpleSchema.RegEx.Id,
    type: {
      type: String,
      allowedValues: ['set', 'increment']
    },
    value: Number,
  }),
  run({_id, type, value}) {
		if (type === 'set'){
			let currentValue = currentAttribute.value;
			// Set represents what we want the value to be after adjustment
			// So we need the actual adjustment to get to that value
			let adjustment = value - currentValue;
			// Ajustment can't exceed total value
			if (-adjustment > currentValue) adjustment = -currentValue;
			// Adjustment must be negative
			if (adjustment > 0) adjustment = 0;
			return Attributes.update(_id, {$set: {adjustment}});
		} else if (type === 'increment'){
			let remaining = currentAttribute.value + (currentAttribute.adjustment || 0);
			let adj = currentAttribute.adjustment;
			// Can't decrease adjustment below remaining value
      let increment = value;
			if (-increment > remaining) increment = -remaining;
			// Can't increase adjustment above zero
			if (increment > -adj) increment = -adj;
			if (typeof currentAttribute.adjustment === 'number'){
				return Attributes.update(_id, {$inc: {adjustment: increment}});
			} else {
				return Attributes.update(_id, {$set: {adjustment: increment}});
			}
		}
  },
});
*/

export default CreatureProperties;
export { CreaturePropertySchema, insertProperty, insertPropertyFromLibraryNode };

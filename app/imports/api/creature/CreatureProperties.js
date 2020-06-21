import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import ColorSchema from '/imports/api/properties/subSchemas/ColorSchema.js';
import ChildSchema, { RefSchema } from '/imports/api/parenting/ChildSchema.js';
import { recomputeCreature } from '/imports/api/creature/computation/recomputeCreature.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import Creatures from '/imports/api/creature/Creatures.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import { softRemove } from '/imports/api/parenting/softRemove.js';
import SoftRemovableSchema from '/imports/api/parenting/SoftRemovableSchema.js';
import propertySchemasIndex from '/imports/api/properties/computedPropertySchemasIndex.js';
import {
	setLineageOfDocs,
	getAncestry,
	renewDocIds
} from '/imports/api/parenting/parenting.js';
import {setDocToLastOrder} from '/imports/api/parenting/order.js';
import { storedIconsSchema } from '/imports/api/icons/Icons.js';

import '/imports/api/creature/actions/doAction.js';

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
	disabled: {
		type: Boolean,
		optional: true,
	},
  icon: {
    type: storedIconsSchema,
    optional: true,
  }
});

for (let key in propertySchemasIndex){
	let schema = new SimpleSchema({});
	schema.extend(propertySchemasIndex[key]);
	schema.extend(CreaturePropertySchema);
  schema.extend(ColorSchema);
	schema.extend(ChildSchema);
	schema.extend(SoftRemovableSchema);
	CreatureProperties.attachSchema(schema, {
		selector: {type: key}
	});
}

export function getCreature(property){
  if (!property) throw new Meteor.Error('No property provided');
  let creature = Creatures.findOne(property.ancestors[0].id);
  if (!creature) throw new Meteor.Error('Creature does not exist');
  return creature;
}

function assertPropertyEditPermission(property, userId){
  let creature = getCreature(property);
  return assertEditPermission(creature, userId);
}

function recomputeCreatures(property){
	for (let ref of property.ancestors){
		if (ref.collection === 'creatures') {
			recomputeCreature.call({charId: ref.id});
		}
	}
}

const insertProperty = new ValidatedMethod({
  name: 'creatureProperties.insert',
	validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({creatureProperty}) {
    delete creatureProperty._id;
    assertPropertyEditPermission(creatureProperty, this.userId);
		let _id = CreatureProperties.insert(creatureProperty);
		let property = CreatureProperties.findOne(_id);
		recomputeCreatures(property);
  },
});

const duplicateProperty = new ValidatedMethod({
  name: 'creatureProperties.duplicate',
  validate: new SimpleSchema({
    _id: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    }
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({_id}) {
    let creatureProperty = CreatureProperties.findOne(_id);
    assertPropertyEditPermission(creatureProperty, this.userId);
    delete creatureProperty._id;
		CreatureProperties.insert(creatureProperty);
    recomputeCreatures(creatureProperty);
  },
});

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
    let insertedDocIds = CreatureProperties.batchInsert(nodes);

    // get the root inserted doc
    let rootId = insertedDocIds[insertedDocIds.length - 1];

		// Recompute the creatures doc was attached to
		recomputeCreatures(node);

		// Return the docId of the last property, the inserted root property
		return rootId;
	},
})

const updateProperty = new ValidatedMethod({
  name: 'creatureProperties.update',
  validate({_id, path}){
		if (!_id) return false;
		// We cannot change these fields with a simple update
		switch (path[0]){
			case 'type':
      case 'order':
      case 'parent':
      case 'ancestors':
			case 'damage':
				throw new Meteor.Error('Permission denied',
				'This property can\'t be updated directly');
		}
  },
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({_id, path, value}) {
    let property = CreatureProperties.findOne(_id);
    assertPropertyEditPermission(property, this.userId);
    let pathString = path.join('.');
    let modifier;
    // unset empty values
    if (value === null || value === undefined){
      modifier = {$unset: {[pathString]: 1}};
    } else {
      modifier = {$set: {[pathString]: value}};
    }
		CreatureProperties.update(_id, modifier, {
			selector: {type: property.type},
		});
		recomputeCreatures(property);
  },
});

export function damagePropertyWork({property, operation, value}){
  if (operation === 'set'){
    let currentValue = property.value;
    // Set represents what we want the value to be after damage
    // So we need the actual damage to get to that value
    let damage = currentValue - value;
    // Damage can't exceed total value
    if (damage > currentValue) damage = currentValue;
    // Damage must be positive
    if (damage < 0) damage = 0;
    CreatureProperties.update(property._id, {
      $set: {damage}
    }, {
      selector: property
    });
  } else if (operation === 'increment'){
    let currentValue = property.value - (property.damage || 0);
    let currentDamage = property.damage;
    let increment = value;
    // Can't increase damage above the remaining value
    if (increment > currentValue) increment = currentValue;
    // Can't decrease damage below zero
    if (-increment > currentDamage) increment = -currentDamage;
    CreatureProperties.update(property._id, {
      $inc: {damage: increment}
    }, {
      selector: property
    });
  }
}

const damageProperty = new ValidatedMethod({
  name: 'creatureProperties.damage',
  validate: new SimpleSchema({
    _id: SimpleSchema.RegEx.Id,
    operation: {
      type: String,
      allowedValues: ['set', 'increment']
    },
    value: Number,
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 20,
    timeInterval: 5000,
  },
  run({_id, operation, value}) {
		let currentProperty = CreatureProperties.findOne(_id);
		// Check permissions
		assertPropertyEditPermission(currentProperty, this.userId);
		// Check if property can take damage
		let schema = CreatureProperties.simpleSchema(currentProperty);
		if (!schema.allowsKey('damage')){
			throw new Meteor.Error(
				'Damage property failed',
				`Property of type "${currentProperty.type}" can't be damaged`
			);
		}
		damagePropertyWork({property: currentProperty, operation, value})
		recomputeCreatures(currentProperty);
  },
});

export function adjustQuantityWork({property, operation, value}){
  // Check if property has quantity
  let schema = CreatureProperties.simpleSchema(property);
  if (!schema.allowsKey('quantity')){
    throw new Meteor.Error(
      'Adjust quantity failed',
      `Property of type "${property.type}" doesn't have a quantity`
    );
  }
  if (operation === 'set'){
    CreatureProperties.update(property._id, {
      $set: {quantity: value}
    }, {
      selector: property
    });
  } else if (operation === 'increment'){
    // value here is 'damage'
    value = -value;
    let currentQuantity = property.quantity;
    if (currentQuantity + value < 0) value = -currentQuantity;
    CreatureProperties.update(property._id, {
      $inc: {quantity: value}
    }, {
      selector: property
    });
  }
}

const adjustQuantity = new ValidatedMethod({
  name: 'creatureProperties.adjustQuantity',
  validate: new SimpleSchema({
    _id: SimpleSchema.RegEx.Id,
    operation: {
      type: String,
      allowedValues: ['set', 'increment']
    },
    value: Number,
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({_id, operation, value}) {
		let currentProperty = CreatureProperties.findOne(_id);
		// Check permissions
		assertPropertyEditPermission(currentProperty, this.userId);
    adjustQuantityWork({property: currentProperty, operation, value});
    recomputeCreatures(currentProperty);
  },
});

const selectAmmoItem = new ValidatedMethod({
  name: 'creatureProperties.selectAmmoItem',
  validate: new SimpleSchema({
    actionId: SimpleSchema.RegEx.Id,
    itemId: SimpleSchema.RegEx.Id,
    itemConsumedIndex: Number,
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({actionId, itemId, itemConsumedIndex}) {
		let action = CreatureProperties.findOne(actionId);
		// Check permissions
		assertPropertyEditPermission(action, this.userId);
    // Check that this index has a document to edit
    let itemConsumed = action.resources.itemsConsumed[itemConsumedIndex];
    if (!itemConsumed){
      throw new Meteor.Error('Resouce not found',
        'Could not set ammo, because the ammo document was not found');
    }
    let itemToLink = CreatureProperties.findOne(itemId);
    if (!itemToLink){
      throw new Meteor.Error('Item not found',
        'Could not set ammo: the item was not found');
    }
    let path = `resources.itemsConsumed.${itemConsumedIndex}.itemId`;
    CreatureProperties.update(actionId, {
      $set: {[path]: itemId}
    }, {
      selector: action,
    });
    recomputeCreatures(action);
  },
});

const pushToProperty = new ValidatedMethod({
	name: 'creatureProperties.push',
	validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
	run({_id, path, value}){
		let property = CreatureProperties.findOne(_id);
    assertPropertyEditPermission(property, this.userId);
		CreatureProperties.update(_id, {
			$push: {[path.join('.')]: value},
		}, {
			selector: {type: property.type},
		});
		recomputeCreatures(property);
	}
});

const pullFromProperty = new ValidatedMethod({
	name: 'creatureProperties.pull',
	validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
	run({_id, path, itemId}){
		let property = CreatureProperties.findOne(_id);
    assertPropertyEditPermission(property, this.userId);
		CreatureProperties.update(_id, {
			$pull: {[path.join('.')]: {_id: itemId}},
		}, {
			selector: {type: property.type},
			getAutoValues: false,
		});
		recomputeCreatures(property);
	}
});

const softRemoveProperty = new ValidatedMethod({
	name: 'creatureProperties.softRemove',
	validate: new SimpleSchema({
		_id: SimpleSchema.RegEx.Id
	}).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
	run({_id}){
		let property = CreatureProperties.findOne(_id);
    assertPropertyEditPermission(property, this.userId);
		softRemove({_id, collection: CreatureProperties});
		recomputeCreatures(property);
	}
});


export default CreatureProperties;
export {
	CreaturePropertySchema,
	insertProperty,
  duplicateProperty,
	insertPropertyFromLibraryNode,
	updateProperty,
	damageProperty,
  adjustQuantity,
  selectAmmoItem,
	pushToProperty,
	pullFromProperty,
	softRemoveProperty,
};

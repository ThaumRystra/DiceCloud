import SimpleSchema from 'simpl-schema';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';
import Creature from '/imports/api/creature/Creatures.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import propertySchemasIndex from '/imports/api/properties/propertySchemasIndex.js';

let CreatureProperties = new Mongo.Collection('creatureProperties');

let CreaturePropertySchema = new SimpleSchema({
	type: {
    type: String,
    allowedValues: Object.keys(propertySchemasIndex),
  },
	charId: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		index: 1,
    optional: true,
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
  run(creatureProperty) {
    assertPropertyEditPermission(creatureProperty, this.userId);
		return CreatureProperties.insert(creatureProperty);
  },
});

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
export { CreaturePropertySchema, insertProperty };

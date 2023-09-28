import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';

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
  run({ _id, operation, value }) {
    // Permissions
    let property = CreatureProperties.findOne(_id);
    let rootCreature = getRootCreatureAncestor(property);
    assertEditPermission(rootCreature, this.userId);

    // Do work
    adjustQuantityWork({ property, operation, value });
  },
});

export function adjustQuantityWork({ property, operation, value }) {
  // Check if property has quantity
  let schema = CreatureProperties.simpleSchema(property);
  if (!schema.allowsKey('quantity')) {
    throw new Meteor.Error(
      'Adjust quantity failed',
      `Property of type "${property.type}" doesn't have a quantity`
    );
  }
  if (operation === 'set') {
    CreatureProperties.update(property._id, {
      $set: { quantity: value, dirty: true }
    }, {
      selector: property
    });
  } else if (operation === 'increment') {
    // value here is 'damage'
    value = -value;
    let currentQuantity = property.quantity;
    if (currentQuantity + value < 0) value = -currentQuantity;
    CreatureProperties.update(property._id, {
      $inc: { quantity: value },
      $set: { dirty: true }
    }, {
      selector: property
    });
  }
}

export default adjustQuantity;

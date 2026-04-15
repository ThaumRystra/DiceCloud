import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import CreatureProperties, { type CreatureProperty } from '/imports/api/creature/creatureProperties/CreatureProperties';
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
  async run({ _id, operation, value }: { _id: string, operation: 'set' | 'increment', value: number }) {
    // Permissions
    const property = await CreatureProperties.findOneAsync(_id);
    if (!property) throw new Meteor.Error('not-found', 'The property to adjust the quantity of was not found')
    const rootCreature = getRootCreatureAncestor(property);
    await assertEditPermission(rootCreature, this.userId);

    // Do work
    await adjustQuantityWork({ property, operation, value });
  },
});

export async function adjustQuantityWork({ property, operation, value }: {
  property: CreatureProperty,
  operation: 'set' | 'increment',
  value: number
}) {
  // Check if property has quantity
  const schema = CreatureProperties.simpleSchema(property);
  if (!schema.allowsKey('quantity')) {
    throw new Meteor.Error(
      'Adjust quantity failed',
      `Property of type "${property.type}" doesn't have a quantity`
    );
  }
  if (operation === 'set') {
    await CreatureProperties.updateAsync(property._id, {
      $set: { quantity: value, dirty: true }
    }, {
      selector: property
    });
  } else if (operation === 'increment') {
    // value here is 'damage'
    value = -value;
    const currentQuantity = 'quantity' in property ? property.quantity : 0;
    if (currentQuantity + value < 0) value = -currentQuantity;
    await CreatureProperties.updateAsync(property._id, {
      $inc: { quantity: value },
      $set: { dirty: true }
    }, {
      selector: property
    });
  }
}

export default adjustQuantity;

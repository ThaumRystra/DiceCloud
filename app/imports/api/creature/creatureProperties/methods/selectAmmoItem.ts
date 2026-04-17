import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { assertDocEditPermission, assertDocExists } from '/imports/api/sharing/sharingPermissions';

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
  async run({ actionId, itemId, itemConsumedIndex }: {
    actionId: string,
    itemId: string,
    itemConsumedIndex: number,
  }) {
    // Permissions
    const action = await CreatureProperties.findOneAsync(actionId);
    assertDocExists(action);
    await assertDocEditPermission(action, this.userId);

    // Check that the property is an action
    if (action.type !== 'action') {
      throw new Meteor.Error('Invalid property type',
        'Could not set ammo, because the property is not an action');
    }

    // Check that this index has a document to edit
    const itemConsumed = action.resources.itemsConsumed[itemConsumedIndex];
    if (!itemConsumed) {
      throw new Meteor.Error('Resouce not found',
        'Could not set ammo, because the ammo document was not found');
    }
    const itemToLink = await CreatureProperties.findOneAsync(itemId);
    if (!itemToLink) {
      throw new Meteor.Error('Item not found',
        'Could not set ammo: the item was not found');
    }
    const path = `resources.itemsConsumed.${itemConsumedIndex}.itemId`;
    await CreatureProperties.updateAsync(actionId, {
      $set: { [path]: itemId, dirty: true }
    }, {
      selector: action,
    });
  },
});

export default selectAmmoItem;

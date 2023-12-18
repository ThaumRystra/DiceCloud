import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';

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
  run({ actionId, itemId, itemConsumedIndex }) {
    // Permissions
    let action = CreatureProperties.findOne(actionId);
    let rootCreature = getRootCreatureAncestor(action);
    assertEditPermission(rootCreature, this.userId);

    // Check that this index has a document to edit
    let itemConsumed = action.resources.itemsConsumed[itemConsumedIndex];
    if (!itemConsumed) {
      throw new Meteor.Error('Resouce not found',
        'Could not set ammo, because the ammo document was not found');
    }
    let itemToLink = CreatureProperties.findOne(itemId);
    if (!itemToLink) {
      throw new Meteor.Error('Item not found',
        'Could not set ammo: the item was not found');
    }
    let path = `resources.itemsConsumed.${itemConsumedIndex}.itemId`;
    CreatureProperties.update(actionId, {
      $set: { [path]: itemId, dirty: true }
    }, {
      selector: action,
    });
  },
});

export default selectAmmoItem;

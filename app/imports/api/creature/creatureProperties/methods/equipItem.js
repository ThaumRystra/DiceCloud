import { ValidatedMethod } from 'meteor/mdg:validated-method';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import { moveWithinRoot } from '/imports/api/parenting/organizeMethods';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor';
import BUILT_IN_TAGS from '/imports/constants/BUILT_IN_TAGS';
import getParentRefByTag from './getParentByTag';

// Equipping or unequipping an item will also change its parent
const equipItem = new ValidatedMethod({
  name: 'creatureProperties.equip',
  validate({ _id, equipped }) {
    if (!_id) throw new Meteor.Error('No _id', '_id is required');
    if (equipped !== true && equipped !== false) {
      throw new Meteor.Error('No equipped', 'equipped is required to be true or false');
    }
  },
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ _id, equipped }) {
    const item = await CreatureProperties.findOneAsync(_id);
    if (!item) throw new Meteor.Error('item not found',
      'Could not find the item to equip or unequip');
    if (item.type !== 'item') throw new Meteor.Error('wrong type',
      'Equip and unequip can only be performed on items');
    const creature = getRootCreatureAncestor(item);
    if (!creature) throw new Meteor.Error('creature not found',
      'The item you are trying to equip is not on a creature'
    );
    await assertEditPermission(creature, this.userId);
    await CreatureProperties.updateAsync(_id, {
      $set: { equipped, dirty: true },
    }, {
      selector: { type: 'item' },
    });
    const tag = equipped ? BUILT_IN_TAGS.equipment : BUILT_IN_TAGS.carried;
    let newPosition = 0.5;
    const newParent = getParentRefByTag(creature._id, tag);
    if (newParent) newPosition = newParent.left + 0.5;

    moveWithinRoot.callAsync({
      docRef: {
        id: _id,
        collection: 'creatureProperties',
      },
      newPosition,
      skipRecompute: true,
    });
  },
});

export default equipItem;

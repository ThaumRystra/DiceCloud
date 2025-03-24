import { ValidatedMethod } from 'meteor/mdg:validated-method';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import { organizeDoc } from '/imports/api/parenting/organizeMethods';
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
  run({ _id, equipped }) {
    let item = CreatureProperties.findOne(_id);
    if (item.type !== 'item') throw new Meteor.Error('wrong type',
      'Equip and unequip can only be performed on items');
    let creature = getRootCreatureAncestor(item);
    assertEditPermission(creature, this.userId);
    CreatureProperties.update(_id, {
      $set: { equipped, dirty: true },
    }, {
      selector: { type: 'item' },
    });
    let tag = equipped ? BUILT_IN_TAGS.equipment : BUILT_IN_TAGS.carried;
    let parentRef = getParentRefByTag(creature._id, tag);
    if (!parentRef) parentRef = { id: creature._id, collection: 'creatures' };

    organizeDoc.callAsync({
      docRef: {
        id: _id,
        collection: 'creatureProperties',
      },
      parentRef,
      order: Number.MAX_SAFE_INTEGER,
      skipRecompute: true,
    });
  },
});

export default equipItem;

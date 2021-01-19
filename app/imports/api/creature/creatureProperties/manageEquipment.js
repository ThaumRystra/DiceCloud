import { ValidatedMethod } from 'meteor/mdg:validated-method';
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import { organizeDoc } from '/imports/api/parenting/organizeMethods.js';
import getClosestPropertyAncestorCreature from '/imports/api/creature/creatureProperties/getClosestPropertyAncestorCreature.js';
import INVENTORY_TAGS from '/imports/constants/INVENTORY_TAGS.js';

function getParentRefByTag(creatureId, tag){
  let prop = CreatureProperties.findOne({
    'ancestors.id': creatureId,
    removed: {$ne: true},
    inactive: {$ne: true},
    tags: tag,
  }, {
    sort: {order: 1},
  });
  if (prop){
    return {id: prop._id, collection: 'creatureProperties'};
  } else {
    return {id: creatureId, collection: 'creatures'};
  }
}

// Equipping or unequipping an item will also change its parent
const equipItem = new ValidatedMethod({
  name: 'creatureProperties.equip',
  validate({_id, equipped}){
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
  run({_id, equipped}) {
    let item = CreatureProperties.findOne(_id);
    if (item.type !== 'item') throw new Meteor.Error('wrong type',
    'Equip and unequip can only be performed on items');
    let creature = getClosestPropertyAncestorCreature(item);
    assertEditPermission(creature, this.userId);
    CreatureProperties.update(_id, {
      $set: {equipped},
    }, {
			selector: {type: 'item'},
		});
    let tag = equipped ? INVENTORY_TAGS.equipment : INVENTORY_TAGS.carried;
    let parentRef = getParentRefByTag(creature._id, tag);
    // organizeDoc handles recompuation
    organizeDoc.call({
      docRef: {
        id: _id,
        collection: 'creatureProperties',
      },
      parentRef,
      order: Number.MAX_SAFE_INTEGER,
    });
  },
});

export { equipItem, getParentRefByTag }

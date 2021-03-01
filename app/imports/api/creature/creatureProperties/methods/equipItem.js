import { ValidatedMethod } from 'meteor/mdg:validated-method';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import { organizeDoc } from '/imports/api/parenting/organizeMethods.js';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import { recomputeCreatureByDoc } from '/imports/api/creature/computation/methods/recomputeCreature.js';
import recomputeInactiveProperties from '/imports/api/creature/denormalise/recomputeInactiveProperties.js';
import recomputeInventory from '/imports/api/creature/denormalise/recomputeInventory.js';
import INVENTORY_TAGS from '/imports/constants/INVENTORY_TAGS.js';

export function getParentRefByTag(creatureId, tag){
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
    let creature = getRootCreatureAncestor(item);
    assertEditPermission(creature, this.userId);
    CreatureProperties.update(_id, {
      $set: {equipped},
    }, {
			selector: {type: 'item'},
		});
    let tag = equipped ? INVENTORY_TAGS.equipment : INVENTORY_TAGS.carried;
    let parentRef = getParentRefByTag(creature._id, tag);

    organizeDoc.call({
      docRef: {
        id: _id,
        collection: 'creatureProperties',
      },
      parentRef,
      order: Number.MAX_SAFE_INTEGER,
      skipRecompute: true,
    });

    recomputeInactiveProperties(creature._id);
    recomputeInventory(creature._id);
    recomputeCreatureByDoc(creature);
  },
});

export default equipItem;

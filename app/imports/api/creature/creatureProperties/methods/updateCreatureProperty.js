import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import { recomputeCreatureByDoc } from '/imports/api/creature/computation/methods/recomputeCreature.js';
import recomputeInactiveProperties from '/imports/api/creature/denormalise/recomputeInactiveProperties.js';
import recomputeInventory from '/imports/api/creature/denormalise/recomputeInventory.js';

const updateCreatureProperty = new ValidatedMethod({
  name: 'creatureProperties.update',
  validate({_id, path}){
		if (!_id) throw new Meteor.Error('No _id', '_id is required');
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
    // Permission
    let property = CreatureProperties.findOne(_id, {
      fields: {type: 1, ancestors: 1}
    });
    let rootCreature = getRootCreatureAncestor(property);
    assertEditPermission(rootCreature, this.userId);

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

    // Some updates might cause other properties to become inactive
    if ([
      'applied', 'equipped', 'prepared', 'alwaysPrepared', 'disabled'
    ].includes(path[0])){
      recomputeInactiveProperties(rootCreature._id);
    }

    if (property.type === 'item' || property.type === 'container'){
      // Potentially changes items and containers
      recomputeInventory(rootCreature._id);
    }
    // Updating a property is likely to change dependencies, do a full recompute
    recomputeCreatureByDoc(rootCreature);
  },
});

export default updateCreatureProperty;

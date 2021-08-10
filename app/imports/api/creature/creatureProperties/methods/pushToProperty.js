import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import { recomputeCreatureByDoc } from '/imports/api/creature/computation/methods/recomputeCreature.js';
import { get } from 'lodash';

const pushToProperty = new ValidatedMethod({
	name: 'creatureProperties.push',
	validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
	run({_id, path, value}){
    // Permissions
		let property = CreatureProperties.findOne(_id);
    let rootCreature = getRootCreatureAncestor(property);
    assertEditPermission(rootCreature, this.userId);

    let joinedPath = path.join('.');

    // Respect maxCount
    let schema = CreatureProperties.simpleSchema(property);
    let maxCount = schema.get(joinedPath, 'maxCount');

    if (Number.isFinite(maxCount)){
      let array = get(property, path);
      let currentCount = array ? array.length : 0;
      if (currentCount >= maxCount){
        throw new Meteor.Error(
          'Array is full',
          `Cannot have more than ${maxCount} values`
        );
      }
    }

    // Do work
		CreatureProperties.update(_id, {
			$push: {[joinedPath]: value},
		}, {
			selector: {type: property.type},
		});

    // TODO figure out if this method can change deps or not
    recomputeCreatureByDoc(rootCreature);
    // recomputePropertyDependencies(property);
	}
});

export default pushToProperty;

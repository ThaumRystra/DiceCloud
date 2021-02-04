import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import { recomputeCreatureByDoc } from '/imports/api/creature/computation/methods/recomputeCreature.js';

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

    // Do work
		CreatureProperties.update(_id, {
			$push: {[path.join('.')]: value},
		}, {
			selector: {type: property.type},
		});

    // TODO figure out if this method can change deps or not
    recomputeCreatureByDoc(rootCreature);
    // recomputePropertyDependencies(property);
	}
});

export default pushToProperty;

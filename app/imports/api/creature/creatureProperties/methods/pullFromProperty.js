import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import computeCreature from '/imports/api/engine/computeCreature.js';

const pullFromProperty = new ValidatedMethod({
	name: 'creatureProperties.pull',
	validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
	run({_id, path, itemId}){
    // Permissions
		let property = CreatureProperties.findOne(_id);
    let rootCreature = getRootCreatureAncestor(property);
    assertEditPermission(rootCreature, this.userId);

    // Do work
		CreatureProperties.update(_id, {
			$pull: {[path.join('.')]: {_id: itemId}},
		}, {
			selector: {type: property.type},
			getAutoValues: false,
		});

    // TODO figure out if this method can change deps or not
    computeCreature(rootCreature._id);
    // recomputePropertyDependencies(property);
	}
});

export default pullFromProperty;

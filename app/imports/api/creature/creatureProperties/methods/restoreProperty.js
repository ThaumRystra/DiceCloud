import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import SimpleSchema from 'simpl-schema';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import { restore } from '/imports/api/parenting/softRemove.js';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import recomputeInactiveProperties from '/imports/api/creature/denormalise/recomputeInactiveProperties.js';
import { recomputeCreatureByDoc } from '/imports/api/creature/computation/methods/recomputeCreature.js';
import recomputeInventory from '/imports/api/creature/denormalise/recomputeInventory.js';

const restoreProperty = new ValidatedMethod({
	name: 'creatureProperties.restore',
	validate: new SimpleSchema({
		_id: SimpleSchema.RegEx.Id
	}).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
	run({_id}){
    // Permissions
		let property = CreatureProperties.findOne(_id);
    let rootCreature = getRootCreatureAncestor(property);
    assertEditPermission(rootCreature, this.userId);

    // Do work
    restore({_id, collection: CreatureProperties});

    // Items and containers might be restored
    recomputeInventory(rootCreature._id);
    // Parents active status may have changed while it was deleted
    recomputeInactiveProperties(rootCreature._id);
    // Changes dependency tree by restoring children
    recomputeCreatureByDoc(rootCreature);
	}
});

export default restoreProperty;

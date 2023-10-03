import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor';

const flipToggle = new ValidatedMethod({
  name: 'creatureProperties.flipToggle',
  validate({ _id }) {
    if (!_id) throw new Meteor.Error('No _id', '_id is required');
  },
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({ _id }) {
    // Permission
    let property = CreatureProperties.findOne(_id, {
      fields: { type: 1, root: 1, enabled: 1, disabled: 1 }
    });
    if (property.type !== 'toggle') {
      throw new Meteor.Error('wrong property',
        'This method can only be applied to toggles');
    }
    if (!property.enabled && !property.disabled) {
      throw new Meteor.Error('Computed toggle',
        'Can\'t flip a toggle that is computed')
    }
    let rootCreature = getRootCreatureAncestor(property);
    assertEditPermission(rootCreature, this.userId);

    // Invert the current value, disabled is the canonical store of value
    const currentValue = !property.disabled;
    CreatureProperties.update(_id, {
      $set: {
        enabled: !currentValue,
        disabled: currentValue,
        dirty: true,
      }
    }, {
      selector: { type: 'toggle' },
    });
  },
});

export default flipToggle;

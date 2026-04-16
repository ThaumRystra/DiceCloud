import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import { getDocByRefAsync } from '/imports/api/parenting/reference';

const flipToggle = new ValidatedMethod({
  name: 'creatureProperties.flipToggle',
  validate({ _id }: { _id: string }) {
    if (!_id) throw new Meteor.Error('No _id', '_id is required');
  },
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ _id }) {
    // Permission
    const property = await CreatureProperties.findOneAsync(_id, {
      fields: { type: 1, root: 1, enabled: 1, disabled: 1 }
    });
    if (!property) {
      throw new Meteor.Error('not-found', 'The toggle could not be found')
    }
    if (property.type !== 'toggle') {
      throw new Meteor.Error('wrong property',
        'This method can only be applied to toggles');
    }
    if (!property.enabled && !property.disabled) {
      throw new Meteor.Error('Computed toggle',
        'Can\'t flip a toggle that is computed')
    }
    const rootDoc = await getDocByRefAsync(property.root);
    await assertEditPermission(rootDoc, this.userId);

    // Invert the current value, disabled is the canonical store of value
    const currentValue = !property.disabled;
    await CreatureProperties.updateAsync(_id, {
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

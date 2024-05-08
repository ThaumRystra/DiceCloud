import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor';

const updateCreatureProperty = new ValidatedMethod({
  name: 'creatureProperties.update',
  validate({ _id, path }) {
    if (!_id) throw new Meteor.Error('No _id', '_id is required');
    // We cannot change these fields with a simple update
    switch (path[0]) {
      case 'type':
      case 'order':
      case 'parent':
      case 'ancestors':
      case 'root':
      case 'left':
      case 'right':
      case 'parentId':
      case 'damage':
        throw new Meteor.Error('Permission denied',
          'This property can\'t be updated directly');
    }
  },
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 12,
    timeInterval: 5000,
  },
  run({ _id, path, value }) {
    // Permission
    let property = CreatureProperties.findOne(_id, {
      fields: { type: 1, root: 1 }
    });
    let rootCreature = getRootCreatureAncestor(property);
    assertEditPermission(rootCreature, this.userId);

    let pathString = path.join('.');
    let modifier;
    // unset empty values
    if (value === null || value === undefined) {
      modifier = { $unset: { [pathString]: 1 }, $set: { dirty: true } };
    } else {
      modifier = { $set: { [pathString]: value, dirty: true } };
    }
    CreatureProperties.update(_id, modifier, {
      selector: { type: property.type },
    });
  },
});

export default updateCreatureProperty;

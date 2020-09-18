import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Creatures from '/imports/api/creature/Creatures.js';
import { assertEditPermission } from '/imports/api/creature/creaturePermissions.js';
import roll from '/imports/parser/roll.js';

const doAction = new ValidatedMethod({
  name: 'creature.doCheck',
  validate: new SimpleSchema({
    actionId: SimpleSchema.RegEx.Id,
    targetId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      optional: true,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 10,
    timeInterval: 5000,
  },
  run({creatureId, attributeName}) {
    let creature = Creatures.findOne(creatureId);
    assertEditPermission(creature, this.userId);
		return doCheckWork({attributeName, creature});
  },
});

function doCheckWork({attributeName, creature}){
  let att = creature.variables[attributeName];
  if (!att) throw new Meteor.Error('No such attribute',
    `This creature does not have a ${attributeName} property`);
  let bonus = att.attributeType === 'ability'? att.modifier : att.value;
  //Always roll 2d20 and let the advantage be decided in UI
  let rolls = roll(2,20);
  return {rolls, bonus};
}

export default doAction;

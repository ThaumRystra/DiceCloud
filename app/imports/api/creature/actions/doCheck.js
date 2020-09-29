import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Creatures from '/imports/api/creature/Creatures.js';
import { assertEditPermission } from '/imports/api/creature/creaturePermissions.js';
import roll from '/imports/parser/roll.js';

const doCheck = new ValidatedMethod({
  name: 'creature.doCheck',
  validate: new SimpleSchema({
    creatureId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      optional: true,
    },
    attributeName: {
      type: String,
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
    let bonus = getAttributeValue({creature, attributeName})
		return doCheckWork({bonus});
  },
});

function getAttributeValue({creature, attributeName}){
  let att = creature.variables[attributeName];
  if (!att) throw new Meteor.Error('No such attribute',
    `This creature does not have a ${attributeName} property`);
  let bonus = att.attributeType === 'ability'? att.modifier : att.value;
  return bonus || 0;
}

export function doCheckWork({bonus, advantage = 0}){
  let rolls = roll(2,20);
  let chosenRoll;
  if (advantage === 1){
    chosenRoll = Math.max.apply(rolls);
  } else if (advantage === -1){
    chosenRoll = Math.min.apply(rolls);
  } else {
    chosenRoll = rolls[0];
  }
  let result = chosenRoll + bonus;
  return {rolls, bonus, chosenRoll, result};
}

export default doCheck;

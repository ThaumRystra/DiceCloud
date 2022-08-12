import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import {
  getPropertiesOfType, getVariables
} from '/imports/api/engine/loadCreatures.js';
import { groupBy, remove } from 'lodash';
import { CreatureLogSchema, insertCreatureLogWork } from '/imports/api/creature/log/CreatureLogs.js';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions.js';
import rollDice from '/imports/parser/rollDice.js';
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
import { applyTrigger } from '/imports/api/engine/actions/applyTriggers.js';

const doCheck = new ValidatedMethod({
  name: 'creatureProperties.doCheck',
  validate: new SimpleSchema({
    propId: SimpleSchema.RegEx.Id,
    scope: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 10,
    timeInterval: 5000,
  },
  run({propId, scope}) {
    const prop = CreatureProperties.findOne(propId);
    const creature = getRootCreatureAncestor(prop);

    // Check permissions
    assertEditPermission(creature, this.userId);

    // Do the check
    doCheckWork({creature, prop, method: this, methodScope: scope});
  },
});

export default doCheck;

export function doCheckWork({
  creature, prop, method, methodScope = {}
}){
  // Create the log
  let log = CreatureLogSchema.clean({
    creatureId: creature._id,
    creatureName: creature.name,
  });

  // Add the variables to the creature document
  const variables = getVariables(creature._id);
  delete variables._id;
  delete variables._creatureId;
  creature.variables = variables;
  const scope = creature.variables;

  // Get the triggers
  let triggers = getPropertiesOfType(creature._id, 'trigger');
  remove(triggers, trigger => trigger.event !== 'check');
  triggers = groupBy(triggers, 'timing');

  // Set the creature as the target
  const targets = [creature];

  applyTriggers(triggers, 'before', { creature, prop, targets, scope, log });
  rollCheck({prop, log, methodScope});
  applyTriggers(triggers, 'after', { creature, prop, targets, scope, log });

  // Insert the log
  insertCreatureLogWork({log, creature, method});
}

function applyTriggers(triggers, timing, opts) {
  // Get matching triggers
  let selectedTriggers = triggers[timing] || [];
  // Sort the triggers
  selectedTriggers.sort((a, b) => a.order - b.order);
  // Apply the triggers
  selectedTriggers.forEach(trigger => {
    applyTrigger(trigger, opts)
  });
}

function rollCheck({prop, log, methodScope}){
  // get the modifier for the roll
  let rollModifier;
  let logName = `${prop.name} check`;
  if (prop.type === 'skill'){
    rollModifier = prop.value;
    if (prop.skillType === 'save'){
      if (prop.name.match(/save/i)){
        logName = prop.name;
      } else {
        logName = prop.name ? `${prop.name} save` : 'Saving Throw';
      }
    }
  } else if (prop.type === 'attribute'){
    if (prop.attributeType === 'ability'){
      rollModifier = prop.modifier;
    } else {
      rollModifier = prop.value;
    }
  } else {
    throw (`${prop.type} not supported for checks`);
  }

  const rollModifierText = numberToSignedString(rollModifier, true);

  let value, values, resultPrefix;
  if (methodScope['$checkAdvantage'] === 1){
    logName += ' (Advantage)';
    const [a, b] = rollDice(2, 20);
    if (a >= b) {
      value = a;
      resultPrefix = `1d20 [ ${a}, ~~${b}~~ ] ${rollModifierText} = `;
    } else {
      value = b;
      resultPrefix = `1d20 [ ~~${a}~~, ${b} ] ${rollModifierText} = `;
    }
  } else if (methodScope['$checkAdvantage'] === -1){
    logName += ' (Disadvantage)';
    const [a, b] = rollDice(2, 20);
    if (a <= b) {
      value = a;
      resultPrefix = `1d20 [ ${a}, ~~${b}~~ ] ${rollModifierText} = `;
    } else {
      value = b;
      resultPrefix = `1d20 [ ~~${a}~~, ${b} ] ${rollModifierText} = `;
    }
  } else {
    values = rollDice(1, 20);
    value = values[0];
    resultPrefix = `1d20 [ ${value} ] ${rollModifierText} = `
  }
  const result = (value + rollModifier) || 0;
  log.content.push({
    name: logName,
    value: `${resultPrefix} **${result}**`,
  });
}

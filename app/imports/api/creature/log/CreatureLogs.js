import SimpleSchema from 'simpl-schema';
import Creatures from '/imports/api/creature/Creatures.js';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import {assertEditPermission} from '/imports/api/creature/creaturePermissions.js';
import { parse, CompilationContext } from '/imports/parser/parser.js';
const PER_CREATURE_LOG_LIMIT = 100;

if (Meteor.isServer){
  var sendWebhookAsCreature = require('/imports/server/discord/sendWebhook.js').sendWebhookAsCreature;
}

let CreatureLogs = new Mongo.Collection('creatureLogs');

let CreatureLogSchema = new SimpleSchema({
	text: {
		type: String,
	},
  type: {
    type: String,
    allowedValues: ['roll', 'change', 'damage', 'info'],
    defaultValue: 'info',
  },
	// The real-world date that it occured, usually sorted by date
	date: {
		type: Date,
		autoValue: function() {
			// If the date isn't set, set it to now
			if (!this.isSet) {
				return new Date();
			}
		},
    index: 1,
	},
  creatureId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1,
  },
});

CreatureLogs.attachSchema(CreatureLogSchema);

// This function should only be called by trusted code. No permission checks
const insertCreatureLog = function({log, creature}){
  const creatureId = creature._id;
  // Build the new log
  if (typeof log === 'string'){
    log = {text: log};
  }
  log.creatureId = creatureId;
  // Insert it
  let id = CreatureLogs.insert(log);
  // Find the first log that is over the limit
  let firstExpiredLog = CreatureLogs.find({
    creatureId
  }, {
    sort: {date: -1},
    skip: PER_CREATURE_LOG_LIMIT,
  });
  // Remove all logs older than the one over the limit
  CreatureLogs.remove({
    creatureId,
    date: {$lte: firstExpiredLog.date},
  });
  //TODO unblock before sending webhooks
  // Send webhooks
  if (Meteor.isServer){
    sendWebhookAsCreature({
      creature,
      content: log.text,
    });
  }
  return id;
};

function equalIgnoringWhitespace(a, b){
  if (typeof a !== 'string' || typeof b !== 'string') return a === b;
  return a.replace(/\s/g,'') === b.replace(/\s/g, '');
}

const logRoll = new ValidatedMethod({
  name: 'creatureLogs.methods.logForCreature',
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
	validate: new SimpleSchema({
		roll: {
			type: String,
		},
		creatureId: {
			type: String,
			regEx: SimpleSchema.RegEx.Id,
		},
	}).validator(),
  run({roll, creatureId}){
    const creature = Creatures.findOne(creatureId);
    assertEditPermission(creature, this.userId);
    let parsedResult = parse(roll);
    let log;
    if (parsedResult === null) {
      log = 'Unexpected end of input';
    }
    else try {
      let logText = [];
      let rollContext = new CompilationContext();
      let compiled = parsedResult.compile(creature.variables, rollContext);
      let compiledString = compiled.toString();
      if (!equalIgnoringWhitespace(compiledString, roll)) logText.push(roll);
      logText.push(compiledString);
      let rolled = compiled.roll(creature.variables, rollContext);
      let rolledString = rolled.toString();
      if (rolledString !== compiledString) logText.push(rolled.toString());
      let result = rolled.reduce(creature.variables, rollContext);
      let resultString = result.toString();
      if (resultString !== rolledString) logText.push(resultString);
      log = logText.join('\n\n');
    } catch (e){
      log = 'Calculation error';
    }
    return insertCreatureLog({log, creature});
  },
});

export default CreatureLogs;
export { CreatureLogSchema, insertCreatureLog, logRoll};

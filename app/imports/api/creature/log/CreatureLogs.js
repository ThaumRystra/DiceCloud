import SimpleSchema from 'simpl-schema';
import Creatures from '/imports/api/creature/Creatures.js';
import LogContentSchema from '/imports/api/creature/log/LogContentSchema.js';
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
	name: {
		type: String,
    optional: true,
	},
  content: {
    type: Array,
    defaultValue: [],
  },
  'content.$': {
    type: LogContentSchema,
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
  creatureName: {
    type: String,
    optional: true,
  },
});

CreatureLogs.attachSchema(CreatureLogSchema);

function removeOldLogs(creatureId){
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
}

function logWebhook({log, creature}){
  if (Meteor.isServer){
    sendWebhookAsCreature({
      creature,
      content: log.text,
    });
  }
}

const insertCreatureLog = new ValidatedMethod({
  name: 'creatureLogs.methods.insertCreatureLog',
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
	validate: new SimpleSchema({
		log: CreatureLogSchema.omit('date'),
	}).validator(),
  run({log}){
    const creatureId = log.creatureId;
    const creature = Creatures.findOne(creatureId, {fields: {
      readers: 1,
      writers: 1,
      owner: 1,
      'settings.discordWebhook': 1,
      name: 1,
      avatarPicture: 1,
    }});
    assertEditPermission(creature, this.userId);
    // Build the new log
    let id = insertCreatureLogWork({log, creature, method: this})
    return id;
  },
});

export function insertCreatureLogWork({log, creature, method}){
  // Build the new log
  if (typeof log === 'string'){
    log = {text: log};
  }
  log.date = new Date();
  // Insert it
  let id = CreatureLogs.insert(log);
  if (Meteor.isServer){
    method.unblock();
    removeOldLogs(creature._id);
    logWebhook({log, creature});
  }
  return id;
}


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
    const creature = Creatures.findOne(creatureId, {fields: {
      variables: 1,
      readers: 1,
      writers: 1,
      owner: 1,
      'settings.discordWebhook': 1,
      name: 1,
      avatarPicture: 1,
    }});
    assertEditPermission(creature, this.userId);
    let parsedResult = parse(roll);
    let logContent;
    if (parsedResult === null) {
      logContent = [{error: 'Unexpected end of input'}];
    }
    else try {
      logContent = [];
      let rollContext = new CompilationContext();
      let compiled = parsedResult.compile(creature.variables, rollContext);
      let compiledString = compiled.toString();
      if (!equalIgnoringWhitespace(compiledString, roll)) logContent.push({
        details: roll
      });
      logContent.push({
        details: compiledString
      });
      let rolled = compiled.roll(creature.variables, rollContext);
      let rolledString = rolled.toString();
      if (rolledString !== compiledString) logContent.push({
        result: rolled.toString()
      });
      let result = rolled.reduce(creature.variables, rollContext);
      let resultString = result.toString();
      if (resultString !== rolledString) logContent.push({
        result: resultString
      });
    } catch (e){
      logContent = [{error: 'Calculation error'}];
    }
    const log = {
      content: logContent,
      creatureId,
      date: new Date(),
    };

    let id = insertCreatureLogWork({log, creature, method: this});

    return id;
  },
});

export default CreatureLogs;
export { CreatureLogSchema, insertCreatureLog, logRoll};

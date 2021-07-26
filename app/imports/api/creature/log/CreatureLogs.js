import SimpleSchema from 'simpl-schema';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import LogContentSchema from '/imports/api/creature/log/LogContentSchema.js';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import {assertEditPermission} from '/imports/api/creature/creatures/creaturePermissions.js';
import {
  parse,
  CompilationContext,
  prettifyParseError
} from '/imports/parser/parser.js';
const PER_CREATURE_LOG_LIMIT = 100;

if (Meteor.isServer){
  var sendWebhookAsCreature = require('/imports/server/discord/sendWebhook.js').sendWebhookAsCreature;
}

let CreatureLogs = new Mongo.Collection('creatureLogs');

let CreatureLogSchema = new SimpleSchema({
  content: {
    type: Array,
    defaultValue: [],
    maxCount: 25,
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
  if (!firstExpiredLog) return;
  // Remove all logs older than the one over the limit
  CreatureLogs.remove({
    creatureId,
    date: {$lte: firstExpiredLog.date},
  });
}

function logToMessageData(log){
  let embed = {
    fields: [],
  };
  log.content.forEach(field => {
    if (!field.name) field.name = '\u200b';
    if (!field.value) field.value = '\u200b';
    embed.fields.push(field);
  });
  return { embeds: [embed] };
}

function logWebhook({log, creature}){
  if (Meteor.isServer){
    sendWebhookAsCreature({
      creature,
      data: logToMessageData(log),
    });
  }
}

const insertCreatureLog = new ValidatedMethod({
  name: 'creatureLogs.methods.insert',
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
    log = {content: [{value: log}]};
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
    let logContent = []
    let parsedResult = undefined;
    try {
      parsedResult = parse(roll);
    } catch (e){
      let error = prettifyParseError(e);
      logContent.push({name: 'Parse Error', value: error});
    }
    if (parsedResult) try {
      let rollContext = new CompilationContext();
      let compiled = parsedResult.compile(creature.variables, rollContext);
      let compiledString = compiled.toString();
      if (!equalIgnoringWhitespace(compiledString, roll)) logContent.push({
        value: roll
      });
      logContent.push({
        value: compiledString
      });
      let rolled = compiled.roll(creature.variables, rollContext);
      let rolledString = rolled.toString();
      if (rolledString !== compiledString) logContent.push({
        value: rolled.toString()
      });
      let result = rolled.reduce(creature.variables, rollContext);
      let resultString = result.toString();
      if (resultString !== rolledString) logContent.push({
        value: resultString
      });
    } catch (e){
      logContent = [{name: 'Calculation error'}];
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

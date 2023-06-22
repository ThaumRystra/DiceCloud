import SimpleSchema from 'simpl-schema';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables.js';
import LogContentSchema from '/imports/api/creature/log/LogContentSchema.js';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions.js';
import { parse, prettifyParseError } from '/imports/parser/parser.js';
import resolve, { toString } from '/imports/parser/resolve.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

const PER_CREATURE_LOG_LIMIT = 100;

if (Meteor.isServer) {
  var sendWebhookAsCreature = require('/imports/server/discord/sendWebhook.js').sendWebhookAsCreature;
}

let CreatureLogs = new Mongo.Collection('creatureLogs');

let CreatureLogSchema = new SimpleSchema({
  content: {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.logContentCount,
  },
  'content.$': {
    type: LogContentSchema,
  },
  // The real-world date that it occured, usually sorted by date
  date: {
    type: Date,
    autoValue: function () {
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
    max: STORAGE_LIMITS.name,
  },
});

CreatureLogs.attachSchema(CreatureLogSchema);

function removeOldLogs(creatureId) {
  // Find the first log that is over the limit
  let firstExpiredLog = CreatureLogs.find({
    creatureId
  }, {
    sort: { date: -1 },
    skip: PER_CREATURE_LOG_LIMIT,
  });
  if (!firstExpiredLog) return;
  // Remove all logs older than the one over the limit
  CreatureLogs.remove({
    creatureId,
    date: { $lte: firstExpiredLog.date },
  });
}

function logToMessageData(log) {
  let embed = {
    fields: [],
  };
  log.content.forEach((field, index) => {
    // Empty character for blank names
    if (!field.name) field.name = '\u200b';
    if (!field.value) field.value = '\u200b';
    // Enforce Discord field character limits
    if (field.name?.length > 256) {
      field.name = field.name.substring(0, 255);
    }
    if (field.value?.length > 1024) {
      field.value = field.value.substring(0, 1024 - 3) + '...';
    }
    // Enforce Discord 25 field limit
    if (index < 25) {
      embed.fields.push(field);
    }
  });
  return { embeds: [embed] };
}

function logWebhook({ log, creature }) {
  if (Meteor.isServer) {
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
  run({ log }) {
    const creatureId = log.creatureId;
    const creature = Creatures.findOne(creatureId, {
      fields: {
        readers: 1,
        writers: 1,
        owner: 1,
        'settings.discordWebhook': 1,
        name: 1,
        avatarPicture: 1,
      }
    });
    assertEditPermission(creature, this.userId);
    // Build the new log
    let id = insertCreatureLogWork({ log, creature, method: this })
    return id;
  },
});

export function insertCreatureLogWork({ log, creature, method }) {
  // Build the new log
  if (typeof log === 'string') {
    log = { content: [{ value: log }] };
  }
  if (!log.content?.length) return;

  // Truncate the string lengths to fit the log content schema
  log.content.forEach((logItem) => {
    if (logItem.value?.length > STORAGE_LIMITS.summary) {
      logItem.value = logItem.value.substring(0, STORAGE_LIMITS.summary - 3) + '...';
    }
  });
  log.date = new Date();

  // Insert it
  let id = CreatureLogs.insert(log);
  if (Meteor.isServer) {
    method?.unblock();
    removeOldLogs(creature._id);
    logWebhook({ log, creature });
  }
  return id;
}


function equalIgnoringWhitespace(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return a === b;
  return a.replace(/\s/g, '') === b.replace(/\s/g, '');
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
  run({ roll, creatureId }) {
    const creature = Creatures.findOne(creatureId, {
      fields: {
        readers: 1,
        writers: 1,
        owner: 1,
        'settings.discordWebhook': 1,
        name: 1,
        avatarPicture: 1,
      }
    });
    assertEditPermission(creature, this.userId);
    const variables = CreatureVariables.findOne({ _creatureId: creatureId });
    let logContent = []
    let parsedResult = undefined;
    try {
      parsedResult = parse(roll);
    } catch (e) {
      let error = prettifyParseError(e);
      logContent.push({ name: 'Parse Error', value: error });
    }
    if (parsedResult) try {
      let {
        result: compiled,
        context
      } = resolve('compile', parsedResult, variables);
      const compiledString = toString(compiled);
      if (!equalIgnoringWhitespace(compiledString, roll)) logContent.push({
        value: roll
      });
      logContent.push({
        value: compiledString
      });
      let { result: rolled } = resolve('roll', compiled, variables, context);
      let rolledString = toString(rolled);
      if (rolledString !== compiledString) logContent.push({
        value: rolledString
      });
      let { result } = resolve('reduce', rolled, variables, context);
      let resultString = toString(result);
      if (resultString !== rolledString) logContent.push({
        value: resultString
      });
    } catch (e) {
      console.error(e);
      logContent = [{ name: 'Calculation error' }];
    }
    const log = {
      content: logContent,
      creatureId,
      date: new Date(),
    };

    let id = insertCreatureLogWork({ log, creature, method: this });

    return id;
  },
});

export default CreatureLogs;
export { CreatureLogSchema, insertCreatureLog, logRoll, PER_CREATURE_LOG_LIMIT };

import Creatures, { type Creature } from '/imports/api/creature/creatures/Creatures';
import LogContentSchema from '/imports/api/creature/log/LogContentSchema';
import { ValidatedMethod, type MethodContext } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions';
import { parse, prettifyParseError } from '/imports/parser/parser';
import resolve from '/imports/parser/resolve';
import toString from '/imports/parser/toString';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { TypedSimpleSchema, type InferType } from '/imports/api/utility/TypedSimpleSchema';
import { assertDocExists } from '/imports/api/sharing/sharingPermissions';

const PER_CREATURE_LOG_LIMIT = 100;

let sendWebhookAsCreature;
if (Meteor.isServer) {
  sendWebhookAsCreature = (await import('../../../server/discord/sendWebhook')).sendWebhookAsCreature;
}

const CreatureLogSchema = TypedSimpleSchema.from({
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
  },
  // The acting creature initiating the logged events
  creatureId: {
    type: String,
  },
  // The tabletop this log is associated with
  tabletopId: {
    type: String,
    optional: true,
  },
  // The action that caused this log entry
  actionId: {
    type: String,
    optional: true,
  },
  creatureName: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
});

export type CreatureLog = InferType<typeof CreatureLogSchema>;

const CreatureLogs = new Mongo.Collection<CreatureLog>('creatureLogs');

CreatureLogs.attachSchema(CreatureLogSchema);

async function removeOldLogs({ creatureId, tabletopId }: { creatureId: string, tabletopId: string }) {
  let filter;
  if (creatureId && tabletopId || (!creatureId && !tabletopId)) {
    throw Error('Provide either creatureId or tabletopId')
  } else if (creatureId) {
    filter = { creatureId };
  } else if (tabletopId) {
    filter = { tabletopId }
  }
  // Find the first log that is over the limit
  const firstExpiredLog = await CreatureLogs.findOneAsync(filter, {
    sort: { date: -1 },
    skip: PER_CREATURE_LOG_LIMIT,
  });
  if (!firstExpiredLog) return;
  // Remove all logs older than the one over the limit
  await CreatureLogs.removeAsync({
    creatureId,
    date: { $lte: firstExpiredLog.date },
  });
}

type DiscordEmbed = { fields: { name: string, value: string, inline?: boolean }[] }

function logToMessageData(log: CreatureLog) {
  const embed: DiscordEmbed = {
    fields: [],
  };
  log.content.forEach((field, index) => {
    // Enforce Discord 25 field limit
    if (index >= 25 || field.silenced) return;
    const discordField: DiscordEmbed['fields'][number] = {
      name: field.name || '\u200b',
      value: field.value || '\u200b',
      inline: field.inline,
    }
    // Enforce Discord field character limits
    if (discordField.name?.length > 256) {
      discordField.name = discordField.name.substring(0, 255);
    }
    if (discordField.value?.length > 1024) {
      discordField.value = discordField.value.substring(0, 1024 - 3) + '...';
    }
    embed.fields.push(discordField);
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
  validate: TypedSimpleSchema.from({
    log: {
      type: CreatureLogSchema.omit('date'),
    }
  }).validator(),
  async run({ log }) {
    const creatureId = log.creatureId;
    const creature = await Creatures.findOneAsync(creatureId);
    assertDocExists(creature);
    await assertEditPermission(creature, this.userId);
    // Build the new log
    const id = await insertCreatureLogWork({ log, creature, method: this })
    return id;
  },
});

export async function insertCreatureLogWork({ log, creature, method }: {
  log: Omit<CreatureLog, 'date'> | string,
  creature: Creature,
  method: MethodContext,
}) {
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
  if (creature && creature.tabletop) log.tabletopId = creature.tabletop;
  // Insert it
  const id = await CreatureLogs.insertAsync(log);
  if (Meteor.isServer) {
    method?.unblock();
    if (creature) {
      logWebhook({ log, creature });
    }
    if (log.tabletopId) {
      await removeOldLogs({ tabletopId: log.tabletopId });
    } else {
      await removeOldLogs({ creatureId: creature._id });
    }
  }
  return id;
}


function equalIgnoringWhitespace(a: string, b: string) {
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
  validate: TypedSimpleSchema.from({
    roll: {
      type: String,
    },
    creatureId: {
      type: String,
      max: 32,
      optional: true,
    },
  }).validator(),
  async run({ roll, creatureId }) {
    if (!creatureId) throw new Meteor.Error('no-id',
      'A creature id must be given'
    );
    const creature = await Creatures.findOneAsync(creatureId, {
      fields: {
        readers: 1,
        writers: 1,
        owner: 1,
        'settings.discordWebhook': 1,
        name: 1,
        avatarPicture: 1,
      }
    });
    assertDocExists(creature);
    await assertEditPermission(creature, this.userId);
    const variables = {}; // TODO get variables from scope
    let logContent = []
    let parsedResult = undefined;
    try {
      parsedResult = parse(roll);
    } catch (e) {
      const error = prettifyParseError(e);
      logContent.push({ name: 'Parse Error', value: error });
    }
    if (parsedResult) try {
      const {
        result: compiled,
        context
      } = await resolve('compile', parsedResult, variables);
      const compiledString = toString(compiled);
      if (!equalIgnoringWhitespace(compiledString, roll)) logContent.push({
        value: roll
      });
      logContent.push({
        value: compiledString
      });
      const { result: rolled } = await resolve('roll', compiled, variables, context);
      const rolledString = toString(rolled);
      if (rolledString !== compiledString) logContent.push({
        value: rolledString
      });
      const { result } = await resolve('reduce', rolled, variables, context);
      const resultString = toString(result);
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

    const id = insertCreatureLogWork({ log, creature, method: this });

    return id;
  },
});

export default CreatureLogs;
export { CreatureLogSchema, insertCreatureLog, logRoll, PER_CREATURE_LOG_LIMIT };

import SimpleSchema from 'simpl-schema';
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
  if (typeof log === 'string'){
    log = {text: log};
  }
  log.creatureId = creature._id;
  let id = CreatureLogs.insert(log);
  if (Meteor.isServer){
    sendWebhookAsCreature({
      creature,
      content: log.text,
    });
  }
  return id;
};

export default CreatureLogs;
export { CreatureLogSchema, insertCreatureLog};

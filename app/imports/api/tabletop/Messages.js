import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Creatures from '/imports/api/creature/creatures/Creatures';
import Tabletops, { assertUserInTabletop } from '/imports/api/tabletop/Tabletops';

const Messages = new Mongo.Collection('messages');

const MessagesSchema = new SimpleSchema({
  tabletopId: {
    type: String,
    max: 32,
  },
  content: {
    type: String,
    max: 1000,
  },
  timestamp: {
    type: Date,
  },
  userId: {
    type: String,
    max: 32,
  },
  username: {
    type: String,
  },
});

Messages.attachSchema(MessagesSchema);

const sendMessage = new ValidatedMethod({

  name: 'messages.send',

  validate: new SimpleSchema({
    content: {
      type: String,
      max: 1000,
    },
    tabletopId: {
      type: String,
      max: 32,
    },
  }).validator(),

  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 10,
    timeInterval: 5000,
  },

  run({ content, tabletopId }) {
    const user = Meteor.user();
    if (!user) {
      throw new Meteor.Error('messages.send.denied',
        'You need to be logged in to send a message');
    }
    assertUserInTabletop(tabletopId, this.userId);

    return Messages.insert({
      content,
      tabletopId,
      timestamp: new Date(),
      userId: user._id,
      username: user.username,
    });
  },

});

const removeMessages = new ValidatedMethod({

  name: 'messages.remove',

  validate: new SimpleSchema({
    messageId: {
      type: String,
      max: 32,
    },
  }).validator(),

  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },

  run({ messageId, tabletopId }) {
    if (!this.userId) {
      throw new Meteor.Error('messages.remove.denied',
        'You need to be logged in to remove a tabletop');
    }
    const message = Messages.findOne(messageId);
    const tabletop = Tabletops.findOne(message.tabletopId);
    if (this.userId !== message.userId && this.userId !== tabletop.gameMaster) {
      throw new Meteor.Error('messages.remove.denied',
        'You don\'t have permission to remove this message');
    }
    const removed = Messages.remove({
      _id: messageId,
    });
    Creatures.update({
      tabletop: tabletopId,
    }, {
      $unset: { tabletop: 1 },
    });
    return removed;
  },

});

export default Messages;
export { sendMessage, removeMessages };

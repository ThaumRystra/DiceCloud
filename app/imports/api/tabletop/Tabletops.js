import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertUserHasPaidBenefits } from '/imports/api/users/patreon/tiers.js';
import Creatures from '/imports/api/creature/Creatures.js';

let Tabletops = new Mongo.Collection('tabletops');

const InitiativeSchema = new SimpleSchema({
  active: {
    type: Boolean,
    defaultValue: false,
  },
  roundNumber: {
    type: SimpleSchema.Integer,
    defaultValue: 0,
  },
  initiativeNumber: {
    type: SimpleSchema.Integer,
    optional: true,
  },
  activeCreature: {
    type: String,
    regEx: SimpleSchema.RegEx.id,
    optional: true,
  },
});

// All creatures in a tabletop have a shared time and space.
let TabletopSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
  },
  initiative: {
    type: InitiativeSchema,
    defaultValue: {},
  },
  gameMaster: {
    type: String,
    regEx: SimpleSchema.RegEx.id,
  },
  players: {
    type: Array,
    defaultValue: [],
  },
  'players.$': {
    type: String,
    regEx: SimpleSchema.RegEx.id,
  },
});

Tabletops.attachSchema(TabletopSchema);

function assertUserIsTabletopOwner(tabletopId, userId){
  let tabletop = Tabletops.findOne(tabletopId);
  if (!tabletop){
    throw new Meteor.Error('Tabletop does not exist',
    'No tabletop could be found for the given tabletop id');
  }
  if (tabletop.gameMaster !== userId){
    throw new Meteor.Error('Not the owner',
    'The user is not the owner of the given tabletop');
  }
}

function assertUserInTabletop(tabletopId, userId){
  let tabletop = Tabletops.findOne(tabletopId);
  if (!tabletop){
    throw new Meteor.Error('Tabletop does not exist',
    'No tabletop could be found for the given tabletop id');
  }
  if (tabletop.gameMaster !== userId && !tabletop.players.includes(userId)){
    throw new Meteor.Error('Not in tabletop',
    'The user is not the gamemaster or a player in the given tabletop');
  }
}

const insertTabletop = new ValidatedMethod({

  name: 'tabletops.insert',

  validate: null,

  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },

  run() {
    if (!this.userId) {
      throw new Meteor.Error('tabletops.insert.denied',
      'You need to be logged in to insert a tabletop');
    }
    assertUserHasPaidBenefits(this.userId);

    return Tabletops.insert({
			gameMaster: this.userId,
		});
  },

});

const removeTabletop = new ValidatedMethod({

  name: 'tabletops.remove',

  validate: new SimpleSchema({
    tabletopId: {
      type: String,
      regEx: SimpleSchema.RegEx.id,
    },
  }).validator(),

  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },

  run({tabletopId}) {
    if (!this.userId) {
      throw new Meteor.Error('tabletops.remove.denied',
      'You need to be logged in to remove a tabletop');
    }
    assertUserHasPaidBenefits(this.userId);
    assertUserIsTabletopOwner(tabletopId, this.userId);
    let removed = Tabletops.remove({
			_id: tabletopId,
		});
    Creatures.update({
      tabletop: tabletopId,
    }, {
      $unset: {tabletop: 1},
    });
    return removed;
  },

});

const addCreaturesToTabletop = new ValidatedMethod({

  name: 'tabletops.addCreatures',

  validate: new SimpleSchema({
    'creatureIds': {
      type: Array,
    },
    'creatureIds.$': {
      type: String,
      regEx: SimpleSchema.RegEx.id,
    },
    tabletopId: {
      type: String,
      regEx: SimpleSchema.RegEx.id,
    },
  }).validator(),

  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 10,
    timeInterval: 5000,
  },

  run({tabletopId, creatureIds}) {
    if (!this.userId) {
      throw new Meteor.Error('tabletops.addCreatures.denied',
      'You need to be logged in to remove a tabletop');
    }
    assertUserHasPaidBenefits(this.userId);
    assertUserInTabletop(tabletopId, this.userId);
    Creatures.update({
      _id: {$in: creatureIds},
      $or: [
        {writers: this.userId},
        {owner: this.userId},
      ],
    }, {
      $set: {tabletop: tabletopId},
    }, {
      multi: true,
    });
  },

});

export default Tabletops;
export { insertTabletop, removeTabletop, addCreaturesToTabletop };

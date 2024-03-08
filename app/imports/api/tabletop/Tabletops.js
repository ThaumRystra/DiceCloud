import SimpleSchema from 'simpl-schema';

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
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
});

// All creatures in a tabletop have a shared time and space.
let TabletopSchema = new SimpleSchema({
  // Details
  name: {
    type: String,
    optional: true,
  },
  description: {
    type: String,
    optional: true,
  },
  imageUrl: {
    type: String,
    optional: true,
  },

  // Permissions by userId
  // Who owns this tabletop and can delete it
  owner: String,
  // The owner will need to included in one of these arrays for specific permissions
  // A user should not appear in more than one of the following arrays
  gameMasters: [String],
  players: [String],
  spectators: [String],
  // Does everyone else have the spectator permission?
  public: {
    type: Boolean,
    defaultValue: false,
    index: 1,
  },

  // Initiative
  initiative: {
    type: InitiativeSchema,
    defaultValue: {},
  },

});

Tabletops.attachSchema(TabletopSchema);

import '/imports/api/tabletop/methods/removeTabletop';
import '/imports/api/tabletop/methods/insertTabletop';
import '/imports/api/tabletop/methods/addCreaturesToTabletop';

export default Tabletops;

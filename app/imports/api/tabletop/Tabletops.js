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

import '/imports/api/tabletop/methods/removeTabletop.js';
import '/imports/api/tabletop/methods/insertTabletop.js';
import '/imports/api/tabletop/methods/addCreaturesToTabletop.js';

export default Tabletops;

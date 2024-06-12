import SimpleSchema from 'simpl-schema';

export type Tabletop = {
  name?: string,
  description?: string,
  imageUrl?: string,
  owner: string,
  gameMasters: string[],
  players: string[],
  spectators: string[],
  public?: true,
  initiative: {
    active: boolean,
    roundNumber: number,
    initiativeNumber?: number,
    activeCreature?: string,
  },
  propCount: number,
}

const Tabletops = new Mongo.Collection<Tabletop>('tabletops');

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
const TabletopSchema = new SimpleSchema({
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
  gameMasters: {
    type: Array,
    defaultValue: [],
  },
  'gameMasters.$': {
    type: String,
    //@ts-expect-error Index not defined in simpl-schema package
    index: 1,
  },
  players: {
    type: Array,
    defaultValue: [],
  },
  'players.$': {
    type: String,
    //@ts-expect-error Index not defined in simpl-schema package
    index: 1,
  },
  spectators: {
    type: Array,
    defaultValue: [],
  },
  'spectators.$': {
    type: String,
    //@ts-expect-error Index not defined in simpl-schema package
    index: 1,
  },
  // Does everyone else have the spectator permission?
  public: {
    type: Boolean,
    optional: true,
    //@ts-expect-error Index not defined in simpl-schema package
    index: 1,
  },

  // Initiative
  initiative: {
    type: InitiativeSchema,
    defaultValue: {},
  },

  // Denormalized fields
  // Number of properties on all creatures in this tabletop
  propCount: {
    type: SimpleSchema.Integer,
    defaultValue: 0,
  },
  // Number of creatures in this tabletop
  creatureCount: {
    type: SimpleSchema.Integer,
    defaultValue: 0,
  },
});

//@ts-expect-error attachSchema not defined in simpl-schema package
Tabletops.attachSchema(TabletopSchema);

import '/imports/api/tabletop/methods/removeTabletop';
import '/imports/api/tabletop/methods/insertTabletop';
import '/imports/api/tabletop/methods/updateTabletop';
import '/imports/api/tabletop/methods/addCreaturesToTabletop';
import '/imports/api/tabletop/methods/updateTabletopSharing';
import '/imports/api/tabletop/methods/addCreaturesFromLibraryToTabletop';
import '/imports/api/tabletop/methods/removeCreatureFromTabletop';

export default Tabletops;

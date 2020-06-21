import SimpleSchema from 'simpl-schema';

let Encounters = new Mongo.Collection('encounters');

const CreatureInitiativeSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
  },
  initiativeRoll: {
    type: SimpleSchema.Integer,
  },
});

const InitiativeSchema = new SimpleSchema({
  // An ordered list of all creatures in the initiative order
  creatures: {
    type: Array,
    defaultValue: [],
  },
  'creatures.$': {
    type: CreatureInitiativeSchema,
  },
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
});

// A creature can be in one ecounter at a time.
// All creatures in an encounter have a shared time and space.
let EncounterSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
  },
  initiative: {
    type: InitiativeSchema,
    defaultValue: {},
  },
});

Encounters.attachSchema(EncounterSchema);

export default Encounters;

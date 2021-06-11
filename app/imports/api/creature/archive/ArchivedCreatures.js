import SimpleSchema from 'simpl-schema';

// Archived creatures is an immutable collection of creatures that are no longer
// in use and can be safely archived by the mongoDB hosting service.
// It keeps the working datasets like creatureProperties much smaller
// than they would otherwise be.
let ArchivedCreatures = new Mongo.Collection('archivedCreatures');

// We use blackbox objects for everything:
// - saves time checking every object against a schema
// - doesn't accidentaly create indices defined in subschemas
// - The objects we are archiving have already been checked against their
//   own schemas
let ArchivedCreatureSchema = new SimpleSchema({
  owner: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
    // The primary index on this collection
		index: 1,
	},
  archiveDate: {
    type: Date,
    // Indexed so the archiving system can archive documents when they
    // get to a certain age
    index: 1,
  },
	creature: {
    type: Object,
    blackbox: true,
  },
  properties: {
    type: Array,
  },
  'properties.$': {
    type: Object,
    blackbox: true,
  },
  experiences: {
    type: Array,
  },
  'experiences.$': {
    type: Object,
    blackbox: true,
  },
  logs: {
    type: Array,
  },
  'logs.$': {
    type: Object,
    blackbox: true,
  },
});

ArchivedCreatures.attachSchema(ArchivedCreatureSchema);

import '/imports/api/creature/archive/methods/index.js';
export default ArchivedCreatures;
